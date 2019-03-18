import { typeCoverage } from "../index";
import { lint } from "type-coverage";
import { codeChecks } from "codechecks";
import { TypeCoverageArtifact, RawTypeCoverageReport } from "../types";

type Mocked<T> = { [k in keyof T]: jest.Mock<T[k]> };

describe("type-coverage", () => {
  const codeChecksMock = require("../__mocks__/codechecks").codeChecks as Mocked<typeof codeChecks>;
  const typeCoverageMock = require("../__mocks__/type-coverage").lint as jest.Mock<typeof lint>;
  beforeEach(() => jest.resetAllMocks());

  it("should work not in PR context", async () => {
    codeChecksMock.isPr.mockReturnValue(false);
    typeCoverageMock.mockReturnValue({
      correctCount: 2,
      totalCount: 2,
      anys: [],
      program: undefined as any,
    });

    await typeCoverage({ tsconfigPath: "./tsconfig.json" });

    expect(codeChecks.report).toBeCalledTimes(0);
    expect(codeChecks.saveValue).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      "type-coverage",
      Object {
        "allUntypedSymbols": Array [],
        "totalSymbols": 2,
        "typedSymbols": 2,
      },
    ],
  ],
  "results": Array [
    Object {
      "isThrow": false,
      "value": undefined,
    },
  ],
}
`);
  });

  it("should work in PR context", async () => {
    codeChecksMock.isPr.mockReturnValue(true);
    codeChecksMock.getValue.mockReturnValue({
      typedSymbols: 2,
      totalSymbols: 4,
      allUntypedSymbols: [
        { filename: "index.ts", character: 1, line: 10, symbol: "app" },
        { filename: "index.ts", character: 1, line: 15, symbol: "res" },
      ],
    } as TypeCoverageArtifact);
    typeCoverageMock.mockReturnValue({
      correctCount: 3,
      totalCount: 4,
      anys: [{ file: "index.ts", character: 1, line: 15, text: "res" }],
      program: undefined as any,
    } as RawTypeCoverageReport);

    await typeCoverage({ tsconfigPath: "./tsconfig.json" });
    expect(codeChecks.report).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "longDescription": "New untyped symbols: 0",
        "name": "Type Coverage",
        "shortDescription": "Change: +25.00% Total: 75.00%",
        "status": "success",
      },
    ],
  ],
  "results": Array [
    Object {
      "isThrow": false,
      "value": undefined,
    },
  ],
}
`);
  });

  it("should work in PR context 2", async () => {
    codeChecksMock.isPr.mockReturnValue(true);
    codeChecksMock.getValue.mockReturnValue({
      typedSymbols: 4,
      totalSymbols: 5,
      allUntypedSymbols: [],
    } as TypeCoverageArtifact);
    typeCoverageMock.mockReturnValue({
      correctCount: 3,
      totalCount: 4,
      anys: [{ file: "index.ts", character: 1, line: 15, text: "res" }],
      program: undefined as any,
    } as RawTypeCoverageReport);

    await typeCoverage({ tsconfigPath: "./tsconfig.json" });
    expect(codeChecks.report).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "longDescription": "New untyped symbols: 1| File | line:character | Symbol |
    |:-----:|:-----:|:-----:|
    | index.ts | 15:1 | res |",
        "name": "Type Coverage",
        "shortDescription": "Change: -5.00% Total: 75.00%",
        "status": "success",
      },
    ],
  ],
  "results": Array [
    Object {
      "isThrow": false,
      "value": undefined,
    },
  ],
}
`);
  });

  it("should work in PR context without baseline", async () => {
    codeChecksMock.isPr.mockReturnValue(true);
    typeCoverageMock.mockReturnValue({
      correctCount: 2,
      totalCount: 2,
      anys: [],
      program: undefined as any,
    });

    await typeCoverage({ tsconfigPath: "./tsconfig.json" });
    expect(codeChecks.report).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "longDescription": "New untyped symbols: 0",
        "name": "Type Coverage",
        "shortDescription": "Change: +100.00% Total: 100.00%",
        "status": "success",
      },
    ],
  ],
  "results": Array [
    Object {
      "isThrow": false,
      "value": undefined,
    },
  ],
}
`);
  });
});
