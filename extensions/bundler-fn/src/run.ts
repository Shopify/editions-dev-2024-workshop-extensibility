import type {
  Input as GeneratedInput,
  FunctionRunResult,
  MergeOperation,
  CartTransform,
  CartLine,
} from "../generated/api";

// TODO: make these hard-coded defaults configurable via metafield
const DEFAULT_PERCENTAGE_DECREASE = 15;
const DEFAULT_BUNDLE_SIZE = 2;

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

  const bundleableCartlines = input.cart.lines.filter((line, idx) => {
    if (line.canBundle?.value !== "true") return false;
    if (idx >= DEFAULT_BUNDLE_SIZE) return false;

    return true;
  });

  if (bundleableCartlines.length !== 2) {
    return EMPTY_OPERATION;
  }

  let originalCost = 0;
  bundleableCartlines.forEach((line) => {
    originalCost += Number(line.cost.amountPerQuantity.amount) * line.quantity;
  });
  const bundleSavings = originalCost * (DEFAULT_PERCENTAGE_DECREASE / 100);

  return {
    operations: [
      {
        merge: {
          parentVariantId: bundleParentId,
          attributes: [
            {
              key: "_bundle_savings_amount",
              value: String(bundleSavings),
            },
          ],
          price: {
            percentageDecrease: {
              value: DEFAULT_PERCENTAGE_DECREASE,
            },
          },
          cartLines: bundleableCartlines.map((line) => ({
            cartLineId: line.id,
            quantity: 1,
          })),
        } as MergeOperation,
      },
    ],
  };
}
