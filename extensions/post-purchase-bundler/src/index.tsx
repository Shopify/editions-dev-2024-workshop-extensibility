import { reactExtension, useCartLines } from "@shopify/ui-extensions-react/checkout";
import type { Product } from "@shopify/hydrogen/storefront-api-types";

import { BundleProductOffer } from "./BundleProductOffer";

const productRecommendationsQuery = `#graphql
  query ProductRecommendations($productId: ID!) {
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
    const lines = useCartLines();
    const firstLine = lines.find(
      (line) => line,
    );

    const recommendation = await fetchFirstRecommendation(
      firstLine?.merchandise.product.id,
    );

    // We should consider rendering a skeleton while we wait for a response

    return (
      <BundleProductOffer recommendation={recommendation}/>
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
