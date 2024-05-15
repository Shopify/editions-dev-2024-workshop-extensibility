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
  useLanguage,
} from "@shopify/ui-extensions-react/checkout";
import type { CartLineChange } from "@shopify/ui-extensions/checkout";
// TODO: we should be able to auto-generate these types, how?
import type {
  ProductVariant,
  CartLine,
} from "@shopify/hydrogen/storefront-api-types";

interface ExtensionProps {
  recommendation?: {
    productTitle: string;
    productVariant: ProductVariant;
  };
  firstLine?: CartLine;
}

// TODO: pull this from bundle parent metafields
const DEFAULT_PERCENTAGE_DECREASE = 15;

export function BundleUpsell({ recommendation, firstLine }: ExtensionProps) {
  const [adding, setAdding] = useState(false);
  const lang = useLanguage();
  const lines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();

  const hasBundles = lines.some((line) => line.lineComponents.length >= 1);
  if (!recommendation || hasBundles || !firstLine) {
    return null;
  }

  const recommendationPrice = Number(
    recommendation.productVariant.price.amount,
  );

  const subtotalPrice = lines.reduce((prev, curr) => {
    return prev + curr.cost.totalAmount.amount;
  }, recommendationPrice);
  const bundleSavings = subtotalPrice * (DEFAULT_PERCENTAGE_DECREASE / 100);

  const discountedBundlePrice = new Intl.NumberFormat(lang.isoCode, {
    style: "currency",
    currency: recommendation.productVariant.price.currencyCode,
  }).format(recommendationPrice - bundleSavings);

  const compareAtPrice = new Intl.NumberFormat(lang.isoCode, {
    style: "currency",
    currency: recommendation.productVariant.price.currencyCode,
  }).format(recommendationPrice);

  return (
    <View
      border="base"
      background="subdued"
      cornerRadius="base"
      padding={["tight", "base", "base", "base"]}
    >
      <Text emphasis="bold">Bundle up and save</Text>
      <BlockSpacer />
      <InlineLayout spacing="tight" columns={["15%", "65%", "20%"]}>
        <Image
          cornerRadius="base"
          accessibilityDescription={recommendation.productVariant.image.altText}
          source={recommendation.productVariant.image.url}
        />
        <BlockLayout rows={["20%", 22]}>
          <BlockSpacer />
          <Text>
            {recommendation.productVariant.title || recommendation.productTitle}
          </Text>
          <InlineStack spacing="tight">
            <Text>{discountedBundlePrice}</Text>
            <Text accessibilityRole="deletion" appearance="subdued">
              {compareAtPrice}
            </Text>
          </InlineStack>
        </BlockLayout>
        <View maxBlockSize={10} minInlineSize="25%" inlineAlignment="end">
          <Button disabled={adding} onPress={handleAddToCart}>
            Add
          </Button>
        </View>
      </InlineLayout>
    </View>
  );

  async function handleAddToCart() {
    const lineChanges: CartLineChange[] = [
      {
        type: "addCartLine",
        merchandiseId: recommendation.productVariant.id,
        quantity: 1,
      },
    ];

    setAdding(true);
    for (const change of lineChanges) {
      const result = await applyCartLinesChange(change);
      if (result.type === "error") {
        console.error(result.message);
        break;
      }
    }
    setAdding(false);
  }
}
