import type {
  Input,
  FunctionRunResult,
} from "../generated/api";

const EMPTY_OPERATION: FunctionRunResult = {
  operations: [],
};

export function run(input: Input): FunctionRunResult {
  return EMPTY_OPERATION;
};