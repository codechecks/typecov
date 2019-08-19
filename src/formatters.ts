import { Options } from "./types";
import { CodeChecksReportStatus } from "@codechecks/client";

interface FormatShortDescriptionArgs {
  coverageDiffPerc: number;
  headTypeCoveragePerc: number;
  newUntypedSymbols: number;
  baseReportExisted: boolean;
}

export function formatShortDescription({
  coverageDiffPerc,
  headTypeCoveragePerc,
  newUntypedSymbols,
  baseReportExisted,
}: FormatShortDescriptionArgs): string {
  if (!baseReportExisted) {
    return "New type coverage report!";
  }
  const change = renderSign(coverageDiffPerc) + perc(coverageDiffPerc);
  const total = perc(headTypeCoveragePerc);

  if (coverageDiffPerc === 0) {
    return `No changes detected. Total: ${total}`;
  }

  return `Change: ${change} Total: ${total} New untyped symbols: ${newUntypedSymbols}`;
}

export function perc(n: number): string {
  return n.toFixed(2) + "%";
}

export function renderSign(value: number): string {
  if (value > 0) {
    return "+";
  } else {
    // we dont' render signs for negative (it's part of a number xD) or 0
    return "";
  }
}

export function getDescriptionAboutThreshold(options: Options, status: CodeChecksReportStatus): string {
  if (!options.atLeast) {
    return "";
  }

  return `Minimum acceptable type coverage: ${perc(options.atLeast)} — ${status == "success" ? "✅" : "🔴"}`;
}
