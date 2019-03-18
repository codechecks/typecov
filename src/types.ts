import { AnyInfo } from "type-coverage/dist/interfaces";

export interface Options {
  tsconfigPath?: string;
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
