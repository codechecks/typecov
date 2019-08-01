import { AnyInfo } from "type-coverage-core";

export interface Options {
  tsconfigPath?: string;
  name?: string;
  ignoreFiles?: string[];
  ignoreCatch?: boolean;
  atLeast?: number;
  strict?: boolean;
}

export interface NormalizedOptions {
  tsconfigPath: string;
  name: string;
  artifactName: string;
  atLeast?: number;
}

export interface TypeCoverageArtifact {
  typedSymbols: number;
  totalSymbols: number;
  allUntypedSymbols: SymbolInfo[];
}

export interface SymbolInfo {
  filename: string;
  line: number;
  character: number;
  symbol: string;
}

export interface RawTypeCoverageReport {
  correctCount: number;
  totalCount: number;
  anys: AnyInfo[];
}
