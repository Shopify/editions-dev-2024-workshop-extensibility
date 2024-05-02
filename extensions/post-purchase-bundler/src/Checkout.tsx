import { useEffect, useState } from "react";
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
  useCartLines,
  useApplyCartLinesChange,
  useApi,
  useTotalAmount,
} from "@shopify/ui-extensions-react/checkout";
// Set up the entry point for the extension
export default reactExtension(
  "purchase.checkout.cart-line-list.render-after",
  async (api) => {
    const productId = api.lines.current[0]?.merchandise.product.id;
    const recommendation = await fetchFirstRecommendation(productId);

    return <App recommendation={recommendation} />;

    async function fetchFirstRecommendation(productId: string) {
      if (!productId) {
        return;
      }

      try {
        // TODO: hookup types
        const results = await api.query(
          `query productRecommendations($productId: ID!) {
            productRecommendations(productId: $productId) {
              title,
              variants(first: 1){
                nodes{
                  id,
                  price {
                    amount
                  },
                  image {
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

        if (!results.data) {
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

interface Props {
  recommendation?: { productTitle: string; productVariant: object };
}

function App({ recommendation }: Props) {
  const { i18n } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [adding, setAdding] = useState(false);
  const [showError, setShowError] = useState(false);
  const cost = useTotalAmount();
  const lines = useCartLines();
  console.log(lines);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  async function handleAddToCart(variantId) {
    setAdding(true);

    let result = await applyCartLinesChange({
      type: "updateCartLine",
      id: lines[0].id,
      attributes: [
        {
          key: "_original_cost",
          value: String(lines[0].cost.totalAmount.amount),
        },
      ],
    });

    result = await applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: variantId,
      quantity: 1,
      attributes: [
        {
          key: "_original_cost",
          value: recommendation.productVariant.price.amount,
        },
      ],
    });

    setAdding(false);

    if (result.type === "error") {
      setShowError(true);
      console.error(result.message);
    }
  }

  if (!recommendation) {
    return null;
  }

  const hasBundles = lines.some((line) => line.lineComponents.length > 1);
  if (hasBundles) {
    const originalPrice = lines.reduce((total, line) => {
      return (
        total +
        line.lineComponents.reduce((lineTotal, lineComp) => {
          const attr = lineComp.attributes.find(
            (attr) => attr.key === "_original_cost",
          );
          if (!attr) return lineTotal;
          return lineTotal + Number(attr.value);
        }, 0)
      );
    }, 0);

    // TODO: format to locality, format with currency
    const num = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(originalPrice - cost.amount);
    console.log(cost.amount, originalPrice);

    return <Heading level={2}>you're saving {String(num)}!!!</Heading>;
  }

  return (
    <ProductOffer
      product={recommendation.productVariant}
      title={recommendation.productTitle}
      i18n={i18n}
      adding={adding}
      handleAddToCart={handleAddToCart}
      showError={showError}
    />
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
            aspectRatio={1}
          />
          <BlockStack spacing="none">
            <Text size="medium" emphasis="bold">
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
