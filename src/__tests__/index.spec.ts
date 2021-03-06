import { typecov } from "../index";
import { lint } from "type-coverage-core";
import { codechecks } from "@codechecks/client";
import { TypeCoverageArtifact, RawTypeCoverageReport } from "../types";

type Mocked<T> = { [k in keyof T]: jest.Mock<T[k]> };

describe("type-coverage", () => {
  const codechecksMock = require("../__mocks__/@codechecks/client").codechecks as Mocked<typeof codechecks>;
  const typeCoverageMock = require("../__mocks__/type-coverage-core").lint as jest.Mock<typeof lint>;
  beforeEach(() => jest.resetAllMocks());

  it("should work not in PR context", async () => {
    codechecksMock.isPr.mockReturnValue(false);
    typeCoverageMock.mockReturnValue({
      correctCount: 2,
      totalCount: 2,
      anys: [],
      program: undefined as any,
    });

    await typecov({ tsconfigPath: "./tsconfig.json" });

    expect(codechecks.report).toBeCalledTimes(0);
    expect(codechecks.saveValue).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      "typecov/default",
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
    codechecksMock.isPr.mockReturnValue(true);
    codechecksMock.getValue.mockReturnValue({
      typedSymbols: 2,
      totalSymbols: 4,
      allUntypedSymbols: [
        { filename: "index.ts", character: 1, line: 10, symbol: "app" },
        { filename: "index.ts", character: 1, line: 15, symbol: "res" },
        { filename: "index.ts", character: 2, line: 15, symbol: "key" }, // here we test that plugin doesnt care about exact place of a symbol, just it's name
      ],
    } as TypeCoverageArtifact);
    typeCoverageMock.mockReturnValue({
      correctCount: 3,
      totalCount: 4,
      anys: [
        { file: "index.ts", character: 1, line: 15, text: "res" },
        { file: "index.ts", character: 3, line: 16, text: "key" },
      ],
      program: undefined as any,
    } as RawTypeCoverageReport);

    await typecov({ tsconfigPath: "./tsconfig.json" });
    expect(codechecks.report).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "longDescription": "### Current type coverage: 75.00%

### New untyped symbols: 0",
        "name": "TypeCov",
        "shortDescription": "Change: +25.00% Total: 75.00% New untyped symbols: 0",
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
    codechecksMock.isPr.mockReturnValue(true);
    codechecksMock.getValue.mockReturnValue({
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

    await typecov({ tsconfigPath: "./tsconfig.json" });
    expect(codechecks.report).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "longDescription": "### Current type coverage: 75.00%

### New untyped symbols: 1

| File | line:character | Symbol |
|:-----:|:-----:|:-----:|
| index.ts | 15:1 | res |",
        "name": "TypeCov",
        "shortDescription": "Change: -5.00% Total: 75.00% New untyped symbols: 1",
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
    codechecksMock.isPr.mockReturnValue(true);
    typeCoverageMock.mockReturnValue({
      correctCount: 2,
      totalCount: 2,
      anys: [],
      program: undefined as any,
    });

    await typecov({ tsconfigPath: "./tsconfig.json" });
    expect(codechecks.report).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "longDescription": "### Current type coverage: 100.00%

### New untyped symbols: 0",
        "name": "TypeCov",
        "shortDescription": "New type coverage report!",
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

  it("should handle atLeast option", async () => {
    codechecksMock.isPr.mockReturnValue(true);
    typeCoverageMock.mockReturnValue({
      correctCount: 4,
      totalCount: 10,
      anys: [],
      program: undefined as any,
    });

    await typecov({ tsconfigPath: "./tsconfig.json", atLeast: 50 });
    expect(codechecks.report).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "longDescription": "### Current type coverage: 40.00%
Minimum acceptable type coverage: 50.00% — 🔴
### New untyped symbols: 0",
        "name": "TypeCov",
        "shortDescription": "New type coverage report!",
        "status": "failure",
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

  it("should handle atLeast option when it is 100%", async () => {
    codechecksMock.isPr.mockReturnValue(true);
    typeCoverageMock.mockReturnValue({
      correctCount: 10,
      totalCount: 10,
      anys: [],
      program: undefined as any,
    });

    await typecov({ tsconfigPath: "./tsconfig.json", atLeast: 100 });
    expect(codechecks.report).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "longDescription": "### Current type coverage: 100.00%
Minimum acceptable type coverage: 100.00% — ✅
### New untyped symbols: 0",
        "name": "TypeCov",
        "shortDescription": "New type coverage report!",
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

  it("should round down coverage", async () => {
    codechecksMock.isPr.mockReturnValue(true);
    typeCoverageMock.mockReturnValue({
      correctCount: 26,
      totalCount: 64,
      anys: [],
      program: undefined as any,
    });

    // 26/64 = 40.625% which is < 40.63
    await typecov({ tsconfigPath: "./tsconfig.json", atLeast: 40.63 });
    expect(codechecks.report).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "longDescription": "### Current type coverage: 40.62%
Minimum acceptable type coverage: 40.63% — 🔴
### New untyped symbols: 0",
        "name": "TypeCov",
        "shortDescription": "New type coverage report!",
        "status": "failure",
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
