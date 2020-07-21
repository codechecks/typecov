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

export function floor(n: number, precision = 2): number {
  const factor = Math.pow(10, precision);

  return Math.floor(n * factor) / factor;
}

export function perc(n: number, precision = 2): string {
  // Round down when losing precision to err on the side of caution.
  // E.g. 99.9999% is still less than 100% so should render as 99.99% instead.
  return floor(n, precision).toFixed(precision) + "%";
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
