import { formatShortDescription } from "../formatters";

describe("formatters > formatShortDescription", () => {
  it("should work", () => {
    const actual = formatShortDescription({
      coverageDiffPerc: 1.4,
      headTypeCoveragePerc: 90.2,
      newUntypedSymbols: 1,
      baseReportExisted: true,
    });

    expect(actual).toMatchInlineSnapshot(`"Change: +1.40% Total: 90.20% New untyped symbols: 1"`);
  });

  it("should work with atLeast", () => {
    const actual = formatShortDescription({
      coverageDiffPerc: 1.4,
      headTypeCoveragePerc: 90.2,
      newUntypedSymbols: 1,
      baseReportExisted: true,
    });

    expect(actual).toMatchInlineSnapshot(`"Change: +1.40% Total: 90.20% New untyped symbols: 1"`);
  });
});
