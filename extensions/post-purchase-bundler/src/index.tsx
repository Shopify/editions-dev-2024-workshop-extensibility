import { reactExtension } from "@shopify/ui-extensions-react/checkout";
// TODO: we should be able to auto-generate these types, how?
import type { Product } from "@shopify/hydrogen/storefront-api-types";

import { BundleUpsell } from "./BundleUpsell";

const productRecommendationsQuery = `#graphql
  query ProductRecommendations($productId: ID!) {
    # TODO: this is currently inferencing Admin API graph vs Storefront
    productRecommendations(productId: $productId) {
      title
      variants(first: 1) {
        nodes {
          id
          price {
            amount
            currencyCode
          }
          image {
            altText
            url(transform: {
              crop: CENTER,
              maxHeight: 64,
              maxWidth: 64,
            })
          }
        }
      }
    }
  }
`;

export default reactExtension(
  "purchase.checkout.cart-line-list.render-after",
  async (api) => {
    // get first product ID to query for a product recommendation, skip if a bundle
    // Why not use `useCartLines`?
    const firstLine = api.lines.current.find(
      (line) => line.lineComponents.length === 0,
    );

    const recommendation = await fetchFirstRecommendation(
      firstLine?.merchandise.product.id,
    );

    // We should consider rendering a skeleton while we wait for a response

    return (
      <BundleUpsell recommendation={recommendation} firstLine={firstLine} />
    );

    async function fetchFirstRecommendation(productId?: string) {
      if (!productId) {
        return;
      }

      try {
        const results = await api.query<{ productRecommendations: Product[] }>(
          productRecommendationsQuery,
          {
            variables: { productId },
          },
        );

        if (!results.data || !results.data.productRecommendations.length) {
          return;
        }

        if (results.errors) {
          console.error("recommendations error", results.errors);
          return;
        }

        const [{ variants, title }] = results.data.productRecommendations;

        return {
          productTitle: title,
          productVariant: variants.nodes[0],
        };
      } catch (error) {
        console.error(error);
      }
    }
  },
);
