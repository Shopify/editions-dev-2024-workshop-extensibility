import {
  reactExtension,
  useCartLines,
  useApi,
  SkeletonText,
  InlineLayout,
  SkeletonImage,
  BlockStack,
  Divider,
  Heading,
  Button,
  useApplyCartLinesChange,
  Image,
  Text,
} from "@shopify/ui-extensions-react/checkout";
import type {
  CartLine,
  Product,
  ProductVariant,
} from "@shopify/hydrogen/storefront-api-types";

import { useEffect, useState } from "react";
import { CartLineChange } from "@shopify/ui-extensions/checkout";

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
  const [product, setProduct] = useState(null);

  // use the first cartline to query for a product recommendation
  const lines = useCartLines();
  const firstLine = lines.find((line) => line);

  useEffect(() => {
    fetchProduct(firstLine?.merchandise.product.id);
  }, []);

  async function fetchProduct(productId?: string) {
    setLoading(true);
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

      setProduct({
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
    return <LoadingSkeleton />;
  } else if (product) {
    return <BundleProductOffer recommendation={product} />;
  } else {
    return null;
  }
}

function LoadingSkeleton() {
  return (
    <BlockStack spacing="loose">
      <Divider />
      <Heading level={2}>You might also like</Heading>
      <BlockStack spacing="loose">
        <InlineLayout
          spacing="base"
          columns={[64, "fill", "auto"]}
          blockAlignment="center"
        >
          <SkeletonImage aspectRatio={1} />
          <BlockStack spacing="none">
            <SkeletonText inlineSize="large" />
            <SkeletonText inlineSize="small" />
          </BlockStack>
          <Button kind="secondary" disabled={true}>
            Add
          </Button>
        </InlineLayout>
      </BlockStack>
    </BlockStack>
  );
}

interface BundleProductOfferProps {
  recommendation?: {
    productTitle: string;
    productVariant: ProductVariant;
  };
  firstLine?: CartLine;
}

function BundleProductOffer({ recommendation }: BundleProductOfferProps) {
  const [adding, setAdding] = useState(false);
  const applyCartLinesChange = useApplyCartLinesChange();
  const { i18n } = useApi();

  if (!recommendation) {
    return null;
  }

  const productPrice = i18n.formatCurrency(
    Number(recommendation.productVariant.price.amount),
  );

  return (
    <BlockStack spacing="loose">
      <Divider />
      <Heading level={2}>You might also like</Heading>
      <BlockStack spacing="loose">
        <InlineLayout
          spacing="base"
          columns={[64, "fill", "auto"]}
          blockAlignment="center"
        >
          {recommendation.productVariant.image && (
            <Image
              border="base"
              borderWidth="base"
              borderRadius="loose"
              source={recommendation.productVariant.image.url}
              accessibilityDescription={recommendation.productTitle}
              aspectRatio={1}
            />
          )}

          <BlockStack spacing="none">
            <Text>
              {recommendation.productVariant.title ||
                recommendation.productTitle}
            </Text>
            <Text appearance="subdued">{productPrice}</Text>
          </BlockStack>
          <Button
            kind="secondary"
            loading={adding}
            accessibilityLabel={`Add ${recommendation.productTitle} to cart`}
            disabled={adding}
            onPress={handleAddToCart}
          >
            Add
          </Button>
        </InlineLayout>
      </BlockStack>
    </BlockStack>
  );

  async function handleAddToCart() {
    if (!recommendation) {
      return null;
    }
    const lineChange: CartLineChange = {
      type: "addCartLine",
      merchandiseId: recommendation.productVariant.id,
      quantity: 1,
    };

    setAdding(true);
    const result = await applyCartLinesChange(lineChange);
    if (result.type === "error") {
      console.error(result.message);
    }
    setAdding(false);
  }
}
