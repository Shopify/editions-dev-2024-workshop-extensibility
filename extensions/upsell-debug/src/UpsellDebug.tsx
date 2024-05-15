import {
  Button,
  reactExtension,
  useCartLines,
  useApplyCartLinesChange,
} from "@shopify/ui-extensions-react/checkout";
// TODO: we should be able to auto-generate these types, how?
import type { Product } from "@shopify/hydrogen/storefront-api-types";

export default reactExtension("purchase.checkout.block.render", async (api) => {
  const { data } = await api.query<{ products: { nodes: Product[] } }>(`#graphql
    query Products {
      products(first: 10) {
        nodes {
          title
          id
          metafields(identifiers: {namespace: "custom", key: "bundle_parent_2"}) {
            value
          }
          variants(first: 1) {
            nodes {
              id
            }
          }
        }
      }
    }
  `);

  const bundleableProducts = data?.products.nodes.filter((product) => {
    return product.metafields.filter(Boolean).length > 0;
  });

  return <Extension products={bundleableProducts} />;
});

function Extension({ products }: { products: Product[] }) {
  const lines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();

  async function handleReset() {
    for (const line of lines) {
      await applyCartLinesChange({
        type: "removeCartLine",
        id: line.id,
        quantity: line.quantity,
      });
    }

    await applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: products[0].variants.nodes[0].id,
      quantity: 1,
    });
  }

  return <Button onPress={handleReset}>Reset</Button>;
}
