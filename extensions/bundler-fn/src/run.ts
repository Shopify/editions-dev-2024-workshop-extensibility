import type { Input, FunctionRunResult, CartLine } from "../generated/api";

const NO_CHANGES = {
  operations: [],
};

type BundleMapping = Record<
  string,
  {
    parent: string;
    lines: CartLine[];
  }
>;

export function run(input: Input): FunctionRunResult {
  const bundleMapping: BundleMapping = {};

  input.cart.lines.forEach((line) => {
    if (!line.merchandise.bundleReference) {
      return;
    }

    const bundleType = line.merchandise.bundleReference.value;
    bundleMapping[bundleType] = bundleMapping[bundleType] || {
      parent: line.merchandise.bundleParent.value,
      lines: [],
    };

    const bundle = bundleMapping[bundleType];

    bundle.lines.push(line);
  });

  const hasBundleables = Object.values(bundleMapping).some((bundle) => {
    return bundle.lines.length > 1;
  });

  if (!hasBundleables) {
    return NO_CHANGES;
  }

  const operations = Object.entries(bundleMapping).map(([name, bundle]) => {
    return {
      merge: {
        parentVariantId: bundle.lines[0].merchandise.id,
        price: {
          percentageDecrease: {
            value: 10,
          },
        },
        title: name,

        cartLines: bundle.lines.map((line) => ({
          cartLineId: line.id,
          quantity: 1,
        })),
      },
    };
  });

  return { operations };
}
