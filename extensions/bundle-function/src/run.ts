import type { Input, FunctionRunResult } from "../generated/api";

import type {
  Input as GeneratedInput,
  FunctionRunResult,
  MergeOperation,
  CartTransform,
  CartLine,
} from "../generated/api";

// TODO: make these hard-coded defaults configurable via metafield
const DEFAULT_PERCENTAGE_DECREASE = 15;

const EMPTY_OPERATION = {
  operations: [],
};

interface Input extends GeneratedInput {
  cartTransform: CartTransform & {
    bundleParent: {
      value: string;
    };
  };
  cart: {
    lines: (CartLine & {
      canBundle: {
        value: null | "true";
      };
    })[];
  };
}

export function run(input: Input): FunctionRunResult {
  const bundleParentId = input.cartTransform.bundleParent.value;
  const cartHasBundle = input.cart.lines.some(
    (line) =>
      line.merchandise.__typename === "ProductVariant" &&
      line.merchandise.product.id === bundleParentId,
  );

  if (!bundleParentId || input.cart.lines.length <= 1 || cartHasBundle) {
    return EMPTY_OPERATION;
  }

  const lineToBundle1 = input.cart.lines.find((line) => line.bundleWith?.value);
  const lineToBundle2 = input.cart.lines.find(
    (line) => line.id === lineToBundle1.bundleWith,
  );

  if (!lineToBundle1 || !lineToBundle2) {
    return EMPTY_OPERATION;
  }

  const compareAtAmount = [lineToBundle1, lineToBundle2].reduce(
    (sum, line) => sum + Number(line.cost.amountPerQuantity.amount),
    0,
  );

  const bundleSavingsAmount =
    compareAtAmount * (DEFAULT_PERCENTAGE_DECREASE / 100);

  return {
    operations: [
      {
        merge: {
          parentVariantId: bundleParentId,
          attributes: [
            {
              key: "_bundle_savings_amount",
              value: String(bundleSavingsAmount),
            },
          ],
          price: {
            percentageDecrease: {
              value: DEFAULT_PERCENTAGE_DECREASE,
            },
          },
          cartLines: [lineToBundle1, lineToBundle2].map((line) => ({
            cartLineId: line.id,
            quantity: 1,
          })),
        },
      },
    ],
  };
}
