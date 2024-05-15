import type {
  Input,
  FunctionRunResult,
  CartLine,
  MergeOperation,
} from "../generated/api";

const DEFAULT_PERCENTAGE_DECREASE = 15;

interface Bundle2 {
  [bundleParentId: string]: CartLine[];
}

interface Bundle {
  cartLines: Array<CartLine>;
}

export function run(input: Input): FunctionRunResult {
  const bundleParentId = input.cartTransform.bundleParent.value;
  const mapping = input.cart.lines.reduce<Bundle>(bundler, {cartLines: []});
  if (Object.values(mapping).some((bundle) => bundle?.length <= 1)) {
    return {
      operations: [],
    };
  }
  
  console.error(JSON.stringify(mapping));
  return {
    operations: Object.entries(mapping.cartLines).map((line) => {
      return {
        merge: {
          parentVariantId: bundleParentId,
          price: {
            percentageDecrease: {
              // TODO: make configurable via metafield
              value: DEFAULT_PERCENTAGE_DECREASE,
            },
          },
          //Chris we need to fix this part
          cartLines: line.map((line) => ({
            cartLineId: line.id,
            // TODO: create rules around how this should work in the bundle
            quantity: line.quantity,
          })),
        } as MergeOperation,
      };
    }),
  };
}

function bundler(prev: Bundle, line: CartLine) {
  const merchandise = line.merchandise;
  const attribute = line.attribute;
  if (
    merchandise.__typename !== "ProductVariant" || !attribute 
  ) {
    return prev;
  }

  if (prev.cartLines) {
    return {
      ...prev,
      cartLines: prev.cartLines?.concat(line)
    };
  }

  return {
    ...prev,
    line
  };
}
