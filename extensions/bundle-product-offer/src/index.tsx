import {
  reactExtension,
  useCartLines,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import type { Product } from "@shopify/hydrogen/storefront-api-types";

import { useEffect, useState } from "react";
import {
  BundleProductOffer,
  BundleProductOfferSkeleton,
} from "./BundleProductOffer";

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
  () => <Extension />,
);

function Extension() {
  const { query } = useApi();
  const [loading, setLoading] = useState(false);
  const [recommendedProduct, setRecommendedProduct] = useState(null);

  // use the first cartline to query for a product recommendation
  const lines = useCartLines();
  const firstLine = lines.find((line) => line);

  useEffect(() => {
    fetchProductRecommendation(firstLine?.merchandise.product.id);
  }, []);

  async function fetchProductRecommendation(productId?: string) {
    if (!productId) {
      return;
    }

    setLoading(true);

    try {
      const results = await query<{ productRecommendations: Product[] }>(
        productRecommendationsQuery,
        {
          variables: { productId },
        },
      );

      if (!results.data || !results.data.productRecommendations.length) {
        return;
      }

      if (results.errors) {
        throw new Error(
          results.errors.map((error) => error.message).join("; "),
        );
      }

      const [{ variants, title }] = results.data.productRecommendations;

      setRecommendedProduct({
        productTitle: title,
        productVariant: variants.nodes[0],
      });
    } catch (error) {
      console.error(
        "Error querying storefront API for product recommendation: ",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <BundleProductOfferSkeleton />;
  }

  if (recommendedProduct) {
    return <BundleProductOffer recommendation={recommendedProduct} />;
  }

  return null;
}
