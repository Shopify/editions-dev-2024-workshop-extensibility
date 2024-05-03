import type {
  Input,
  FunctionRunResult,
  CartLine,
  ProductVariant,
  MergeOperation,
} from "../generated/api";

const DEFAULT_PERCENTAGE_DECREASE = 15;

export type ProductVariantWithMetafields = ProductVariant & {
  bundleParent?: {
    value: string;
  };
};

interface Bundle {
  [bundleParentId: string]: CartLine[];
}

export function run(input: Input): FunctionRunResult {
  const mapping = input.cart.lines.reduce<Bundle>(bundler, {});

  if (Object.values(mapping).some((bundle) => bundle.length <= 1)) {
    return {
      operations: [],
    };
  }

  return {
    operations: Object.entries(mapping).map(([parentVariantId, bundle]) => {
      return {
        merge: {
          parentVariantId,
          price: {
            percentageDecrease: {
              // TODO: make configurable via metafield
              value: DEFAULT_PERCENTAGE_DECREASE,
            },
          },
          cartLines: bundle.map((line) => ({
            cartLineId: line.id,
            // TODO: create rules around how this should work in the bundle
            quantity: 1,
          })),
        } as MergeOperation,
      };
    }),
  };
}

function bundler(prev: Bundle, line: CartLine) {
  const merchandise = line.merchandise as ProductVariantWithMetafields;

  if (
    merchandise.__typename !== "ProductVariant" ||
    !merchandise.bundleParent
  ) {
    return prev;
  }

  const bundleKey = merchandise.bundleParent.value;
  if (!prev[bundleKey]) {
    return {
      ...prev,
      [bundleKey]: [line],
    };
  }

  return {
    ...prev,
    [bundleKey]: prev[bundleKey].concat(line),
  };
}
