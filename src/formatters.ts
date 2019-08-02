interface FormatShortDescriptionArgs {
  coverageDiffPerc: number;
  headTypeCoveragePerc: number;
  newUntypedSymbols: number;
  atLeast?: number;
}

export function formatShortDescription({
  coverageDiffPerc,
  atLeast,
  headTypeCoveragePerc,
  newUntypedSymbols,
}: FormatShortDescriptionArgs): string {
  const change = renderSign(coverageDiffPerc) + perc(coverageDiffPerc);
  const limit = atLeast === undefined ? "" : ` (min. ${perc(atLeast)})`;
  const total = perc(headTypeCoveragePerc);

  return `Change: ${change} Total: ${total}${limit} New untyped symbols: ${newUntypedSymbols}`;
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
