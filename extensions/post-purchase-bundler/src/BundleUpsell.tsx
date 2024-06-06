import { useState } from "react";
import {
  Button,
  View,
  Text,
  Image,
  InlineLayout,
  InlineStack,
  BlockLayout,
  BlockSpacer,
  useApplyCartLinesChange,
  useCartLines,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import type { CartLine, CartLineChange } from "@shopify/ui-extensions/checkout";
import type { ProductVariant } from "@shopify/hydrogen/storefront-api-types";

interface ExtensionProps {
  recommendation?: {
    productTitle: string;
    productVariant: ProductVariant;
  };
  firstLine?: CartLine;
}

// TODO: pull this from bundle parent metafield
const DEFAULT_PERCENTAGE_DECREASE = 15;

export function BundleUpsell({ recommendation}: ExtensionProps) {
  const [adding, setAdding] = useState(false);
  const applyCartLinesChange = useApplyCartLinesChange();
  const lines = useCartLines();
  const { i18n } = useApi();

  if (!recommendation) {
    return null;
  }

  const recommendationPrice = Number(
    recommendation.productVariant.price.amount,
  );

  const { format } = new Intl.NumberFormat(lang.isoCode, {
    style: "currency",
    currency: recommendation.productVariant.price.currencyCode,
  });

  const productPrice = format(recommendationPrice);

  return (
    <View
      border="base"
      background="subdued"
      cornerRadius="base"
      padding={["tight", "base", "base", "base"]}
    >
      <Text emphasis="bold">Add to your cart</Text>
      <BlockSpacer />
      <InlineLayout spacing="tight" columns={["fill", "20%"]}>
        <InlineStack>
          <Image
            cornerRadius="base"
            accessibilityDescription={
              recommendation.productVariant.image.altText
            }
            source={recommendation.productVariant.image.url}
          />
          <BlockLayout rows={["20%", 22]}>
            <BlockSpacer />
            <Text>
              {recommendation.productVariant.title ||
                recommendation.productTitle}
            </Text>
              <Text>{productPrice}</Text>
          </BlockLayout>
        </InlineStack>
        <View maxBlockSize={10} minInlineSize="25%" inlineAlignment="end">
          <Button disabled={adding} onPress={handleAddToCart}>
            Add
          </Button>
        </View>
      </InlineLayout>
    </View>
  );

  async function handleAddToCart() {
    const lineChange: CartLineChange =
      {
        type: "addCartLine",
        merchandiseId: recommendation.productVariant.id,
        quantity: 1
      };

    setAdding(true);
    const result = await applyCartLinesChange(lineChange);
    if (result.type === "error") {
      console.error(result.message);
    }
    setAdding(false);
  }
}
