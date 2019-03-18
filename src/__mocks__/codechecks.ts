import * as CodeChecks from "codechecks";
import { join } from "path";

export const codeChecks: Partial<typeof CodeChecks.codeChecks> = {
  report: jest.fn(),
  success: jest.fn(),
  failure: jest.fn(),
  getValue: jest.fn(),
  saveValue: jest.fn(),
  getCollection: jest.fn(),
  saveCollection: jest.fn(),
  isPr: jest.fn(),
  context: {
    workspaceRoot: join(__dirname, ".."),
  } as any,
};
