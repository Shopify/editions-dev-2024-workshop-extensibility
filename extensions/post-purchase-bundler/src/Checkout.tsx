// import { useState, useEffect } from "react";
// import {
//   Banner,
//   useApi,
//   useTranslate,
//   reactExtension,
//   useCartLines,
//   Button,
//   useCartLineTarget,
// } from "@shopify/ui-extensions-react/checkout";

// const PRODUCT_QUERY = `query ($first: Int!) {
//   products(first: $first) {
//     nodes {
//       id
//       title
//       variants(first: 1) {
//         nodes {
//           id
//           title
//           metafield(key: "bundle_parent", namespace: "custom") {
//             value
//           }
//         }
//       }
//     }
//   }
// }`;

// export default reactExtension(
//   "purchase.checkout.cart-line-item.render-after",
//   async (api) => {
//     const mapping = {};
//     try {
//       const results = await api.query(PRODUCT_QUERY, {
//         variables: { first: 5 },
//       });

//       if (results.data.products.nodes.length) {
//         results.data.products.nodes.forEach(({ variants }) => {
//           if (variants.nodes[0].metafield?.value) {
//             mapping[variants.nodes[0].id] = variants.nodes[0].metafield?.value;
//           }
//         });
//       }
//     } catch (e) {
//       console.error(e);
//     }

//     return <Extension mapping={mapping} />;
//   },
// );

// interface Props {
//   mapping: Record<string, string>;
// }

// function Extension({ mapping }: Props) {
//   const line = useCartLineTarget();

//   if (line.lineComponents.length > 0) {
//     return;
//   }

//   const maybeBundleUpsellId = mapping[line.merchandise.id];
//   console.log(maybeBundleUpsellId);

//   return <Button>Supersize Me</Button>;
// }

import React, { useEffect, useState } from "react";
import {
  reactExtension,
  Divider,
  Image,
  Banner,
  Heading,
  Button,
  InlineLayout,
  BlockStack,
  Text,
  SkeletonText,
  SkeletonImage,
  useCartLines,
  useApplyCartLinesChange,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
// Set up the entry point for the extension
export default reactExtension(
  "purchase.checkout.cart-line-list.render-after",
  async (api) => {
    const productId = api.lines.current[0]?.merchandise.product.id;
    const { products, productTitle } = await fetchProducts(productId);

    return <App products={products} productTitle={productTitle} />;

    async function fetchProducts(productId: string) {
      try {
        const results = await api.query(
          `query productRecommendations($productId: ID!) {
            productRecommendations(productId: $productId) {
              title,
              variants(first: 1){
                nodes{
                  id,
                  price{
                    amount
                  },
                  image{
                    url
                  },
                }
              }
            }
          }`,
          {
            variables: { productId },
          },
        );

        console.log(results);

        return {
          products: results.data.productRecommendations[0].variants.nodes[0],
          productTitle: results.data.productRecommendations[0].title,
        };
      } catch (error) {
        console.error(error);
      }
    }
  },
);

function App({ products, productTitle }) {
  const { i18n } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [loading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showError, setShowError] = useState(false);
  const lines = useCartLines();
  const sourceBundleCartLine = lines[0].id;

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  async function handleAddToCart(variantId) {
    setAdding(true);
    var result = await applyCartLinesChange({
      type: "updateCartLine",
      id: sourceBundleCartLine,
      attributes: [
        {
          key: "_bundle_discount",
          value: "source",
        },
      ],
    });
    result = await applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: variantId,
      quantity: 1,
      attributes: [
        {
          key: "_bundle_discount",
          value: "apply",
        },
      ],
    });
    setAdding(false);
    if (result.type === "error") {
      setShowError(true);
      console.error(result.message);
    }
  }

  if (
    lines.find(
      (line) => line.attributes && line.attributes[0]?.value === "source",
    )
  ) {
    return null;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!loading && !products) {
    return null;
  }
  if (!products) {
    return null;
  }

  return (
    <ProductOffer
      product={products}
      title={productTitle}
      i18n={i18n}
      adding={adding}
      handleAddToCart={handleAddToCart}
      showError={showError}
    />
  );
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

function ProductOffer({
  product,
  title,
  i18n,
  adding,
  handleAddToCart,
  showError,
}) {
  const { id, image, price } = product;
  const renderPrice = i18n.formatCurrency(price.amount);
  const imageUrl = image.url;

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
          <Image
            border="base"
            borderWidth="base"
            borderRadius="loose"
            source={imageUrl}
            description={title}
            aspectRatio={1}
          />
          <BlockStack spacing="none">
            <Text size="medium" emphasis="strong">
              {title}
            </Text>
            <Text appearance="subdued">{renderPrice}</Text>
          </BlockStack>
          <Button
            kind="secondary"
            loading={adding}
            accessibilityLabel={`Add ${title} to cart`}
            onPress={() => handleAddToCart(id)}
          >
            Add
          </Button>
        </InlineLayout>
      </BlockStack>
      {showError && <ErrorBanner />}
    </BlockStack>
  );
}

function ErrorBanner() {
  return (
    <Banner status="critical">
      There was an issue adding this product. Please try again.
    </Banner>
  );
}
