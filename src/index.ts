import { codeChecks, CodeChecksReport } from "codechecks";
import { lint as getTypeCoverageInfo } from "type-coverage";
import { RawTypeCoverageReport, TypeCoverageArtifact, Options, SymbolInfo } from "./types";

const ARTIFACT_KEY = "type-coverage";

const defaultOptions: Required<Options> = {
  tsconfigPath: "tsconfig.json",
};

export async function typeCoverage(_options: Options): Promise<void> {
  const options: Required<Options> = {
    ...defaultOptions,
    ..._options,
  };
  const _typeCoverage = await getTypeCoverageInfo(options.tsconfigPath, true, false);
  const typeCoverage = normalizeTypeCoverage(_typeCoverage);
  await codeChecks.saveValue(ARTIFACT_KEY, typeCoverage);

  if (!codeChecks.isPr()) {
    return;
  }

  const baseTypeCoverage = await codeChecks.getValue<TypeCoverageArtifact>(ARTIFACT_KEY);

  const report = getReport(typeCoverage, baseTypeCoverage);

  await codeChecks.report(report);
}

function getReport(
  headTypeCoverageArtifact: TypeCoverageArtifact,
  baseTypeCoverageArtifact: TypeCoverageArtifact | undefined,
): CodeChecksReport {
  const headTypeCoverage = (headTypeCoverageArtifact.typedSymbols / headTypeCoverageArtifact.totalSymbols) * 100;
  const baseTypeCoverage = baseTypeCoverageArtifact
    ? (baseTypeCoverageArtifact.typedSymbols / baseTypeCoverageArtifact.totalSymbols) * 100
    : 0;

  const coverageDiff = headTypeCoverage - baseTypeCoverage;

  const shortDescription = `Change: ${renderSign(coverageDiff)}${perc(coverageDiff)} Total: ${perc(headTypeCoverage)}`;

  const newUntypedSymbols = findNew(
    headTypeCoverageArtifact.allUntypedSymbols,
    baseTypeCoverageArtifact ? baseTypeCoverageArtifact.allUntypedSymbols : [],
  );

  let longDescription = `New untyped symbols: ${newUntypedSymbols.length}`;
  if (newUntypedSymbols.length > 0) {
    longDescription += `| File | line:character | Symbol |
    |:-----:|:-----:|:-----:|
    ${newUntypedSymbols.map(s => `| ${s.filename} | ${s.line}:${s.character} | ${s.symbol} |`).join("\n")}`;
  }

  return {
    name: "Type Coverage",
    status: "success",
    shortDescription,
    longDescription,
  };
}

// @TODO: this is n^2. Fix it
function findNew(headSymbols: SymbolInfo[], baseSymbols: SymbolInfo[]): SymbolInfo[] {
  const newSymbols: SymbolInfo[] = [];

  for (const headSymbol of headSymbols) {
    const baseSymbolMatch =
      baseSymbols.filter(
        s =>
          s.filename === headSymbol.filename &&
          s.line === headSymbol.line &&
          s.character === headSymbol.character &&
          s.symbol === headSymbol.symbol,
      ).length > 0;

    if (!baseSymbolMatch) {
      newSymbols.push(headSymbol);
    }
  }

  return newSymbols;
}

function perc(n: number): string {
  return n.toFixed(2) + "%";
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

function renderSign(value: number): string {
  if (value > 0) {
    return "+";
  } else {
    // we dont' render signs for negative (it's part of a number xD) or 0
    return "";
  }
}
