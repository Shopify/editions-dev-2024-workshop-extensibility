import { describe, it, expect } from "vitest";
import { run, ProductVariantWithMetafields } from "./run";
import { FunctionRunResult, Merchandise } from "../generated/api";

describe("cart transform function", () => {
  it("returns no operation", () => {
    const result = run({
      cart: {
        lines: [
          {
            id: "gid://shopify/CartLine/112233",
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/123",
              title: null,
              bundleParent: {
                value: "gid://shopify/ProductVariant/AAA",
              },
            },
          },
          {
            id: "gid://shopify/CartLine/445566",
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/456",
              title: null,
              bundleParent: {
                value: "gid://shopify/ProductVariant/BBB",
              },
            },
          },
        ],
      },
    });

    const expected: FunctionRunResult = {
      operations: [],
    };

    expect(result).toEqual(expected);
  });

  it("returns merge operations", () => {
    const result = run({
      cart: {
        lines: [
          {
            id: "gid://shopify/CartLine/112233",
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/123",
              title: null,
              bundleParent: {
                value: "gid://shopify/ProductVariant/AAAAAA",
              },
            },
          },
          {
            id: "gid://shopify/CartLine/445566",
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/456",
              title: null,
              bundleParent: {
                value: "gid://shopify/ProductVariant/AAAAAA",
              },
            },
          },
          {
            id: "gid://shopify/CartLine/778899",
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/789",
              title: null,
              bundleParent: {
                value: "gid://shopify/ProductVariant/BBBBBB",
              },
            },
          },
          {
            id: "gid://shopify/CartLine/001122",
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/012",
              title: null,
              bundleParent: {
                value: "gid://shopify/ProductVariant/BBBBBB",
              },
            },
          },
        ],
      },
    });

    const expected: FunctionRunResult = {
      operations: [
        {
          merge: {
            parentVariantId: "gid://shopify/ProductVariant/AAAAAA",
            price: { percentageDecrease: { value: 15 } },
            cartLines: [
              { cartLineId: "gid://shopify/CartLine/112233", quantity: 1 },
              { cartLineId: "gid://shopify/CartLine/445566", quantity: 1 },
            ],
          },
        },
        {
          merge: {
            parentVariantId: "gid://shopify/ProductVariant/BBBBBB",
            price: { percentageDecrease: { value: 15 } },
            cartLines: [
              { cartLineId: "gid://shopify/CartLine/778899", quantity: 1 },
              { cartLineId: "gid://shopify/CartLine/001122", quantity: 1 },
            ],
          },
        },
      ],
    };

    expect(result).toEqual(expected);
  });
});
