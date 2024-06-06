import type {
  RunInput,
  FunctionRunResult,
} from "../generated/api";

const EMPTY_OPERATION: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  return EMPTY_OPERATION;
};