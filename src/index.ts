import { codechecks, CodeChecksReport } from "@codechecks/client";
import { lint as getTypeCoverageInfo } from "type-coverage-core";
import { RawTypeCoverageReport, TypeCoverageArtifact, Options, SymbolInfo, NormalizedOptions } from "./types";
import { groupBy } from "lodash";
import { formatShortDescription } from "./formatters";

export async function typeCoverageWatcher(_options: Options): Promise<void> {
  const options = normalizeOptions(_options);
  const _typeCoverage = await getTypeCoverageInfo(options.tsconfigPath, {
    debug: false,
    ignoreCatch: _options.ignoreCatch,
    ignoreFiles: _options.ignoreFiles,
    strict: _options.strict,
  });
  const typeCoverage = normalizeTypeCoverage(_typeCoverage);
  await codechecks.saveValue(options.artifactName, typeCoverage);

  if (!codechecks.isPr()) {
    return;
  }

  const baseTypeCoverage = await codechecks.getValue<TypeCoverageArtifact>(options.artifactName);

  const report = getReport(typeCoverage, baseTypeCoverage, options);

  await codechecks.report(report);
}

export default typeCoverageWatcher;

function getReport(
  headTypeCoverageArtifact: TypeCoverageArtifact,
  baseTypeCoverageArtifact: TypeCoverageArtifact | undefined,
  options: NormalizedOptions,
): CodeChecksReport {
  const headTypeCoverage = (headTypeCoverageArtifact.typedSymbols / headTypeCoverageArtifact.totalSymbols) * 100;
  const baseTypeCoverage = baseTypeCoverageArtifact
    ? (baseTypeCoverageArtifact.typedSymbols / baseTypeCoverageArtifact.totalSymbols) * 100
    : 0;
  const coverageDiff = headTypeCoverage - baseTypeCoverage;

  const newUntypedSymbols = findNew(
    headTypeCoverageArtifact.allUntypedSymbols,
    baseTypeCoverageArtifact ? baseTypeCoverageArtifact.allUntypedSymbols : [],
  );

  const shortDescription = formatShortDescription({
    coverageDiffPerc: coverageDiff,
    atLeast: options.atLeast,
    headTypeCoveragePerc: headTypeCoverage,
    newUntypedSymbols: newUntypedSymbols.length,
  });

  let longDescription = `New untyped symbols: ${newUntypedSymbols.length}`;
  if (newUntypedSymbols.length > 0) {
    longDescription += `

| File | line:character | Symbol |
|:-----:|:-----:|:-----:|
${newUntypedSymbols
  .slice(0, 100)
  .map(s => `| ${s.filename} | ${s.line}:${s.character} | ${s.symbol} |`)
  .join("\n")}`;
  }

  const status = options.atLeast === undefined || headTypeCoverage > options.atLeast ? "success" : "failure";

  return {
    name: options.name,
    status,
    shortDescription,
    longDescription,
  };
}

function findNew(headSymbols: SymbolInfo[], baseSymbols: SymbolInfo[]): SymbolInfo[] {
  const baseSymbolsByFilename = groupBy(baseSymbols, s => s.filename);
  const newSymbols: SymbolInfo[] = [];

  for (const headSymbol of headSymbols) {
    // we assess if symbols are the same only by looking at filename and symbol name (we ignore line and character)
    const baseSymbolMatch =
      (baseSymbolsByFilename[headSymbol.filename] || []).filter(s => s.symbol === headSymbol.symbol).length > 0;

    if (!baseSymbolMatch) {
      newSymbols.push(headSymbol);
    }
  }

  return newSymbols;
}

function normalizeTypeCoverage(rawTypeCoverage: RawTypeCoverageReport): TypeCoverageArtifact {
  return {
    typedSymbols: rawTypeCoverage.correctCount,
    totalSymbols: rawTypeCoverage.totalCount,
    allUntypedSymbols: rawTypeCoverage.anys.map(a => ({
      filename: a.file,
      line: a.line,
      character: a.character,
      symbol: a.text,
    })),
  };
}

function normalizeOptions(options: Options = {}): NormalizedOptions {
  const name = options.name || "Type Coverage";
  return {
    name,
    tsconfigPath: options.name || "tsconfig.json",
    artifactName: `type-coverage:${name}`,
    atLeast: options.atLeast,
  };
}
