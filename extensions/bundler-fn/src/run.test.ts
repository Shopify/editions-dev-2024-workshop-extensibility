import { describe, it, expect } from "vitest";
import { run } from "./run";
import { FunctionRunResult } from "../generated/api";

describe("cart transform function", () => {
  it("returns no operations", () => {
    const result = run({
      cart: {
        lines: [
          {
            id: "gid://shopify/CartLine/1",
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/1099",
              title: "Something not bundled",
            },
          },
          {
            id: "gid://shopify/CartLine/4",
            quantity: 9,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/1111",
              title: "A neat bundle",
              component_reference: {
                value:
                  '["gid://shopify/ProductVariant/111","gid://shopify/ProductVariant/222"]',
              },
            },
          },
        ],
      },
    });
    const expected: FunctionRunResult = { operations: [] };

    expect(result).toEqual(expected);
  });
});
