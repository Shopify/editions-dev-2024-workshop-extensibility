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

export function BundleUpsell({ recommendation, firstLine }: ExtensionProps) {
  const [adding, setAdding] = useState(false);
  const applyCartLinesChange = useApplyCartLinesChange();
  const lines = useCartLines();
  const { i18n } = useApi();

  const hasBundles = lines.some((line) => line.lineComponents.length >= 1);
  if (!recommendation || hasBundles || !firstLine) {
    return null;
  }

  const { upsellCompareAtPrice, upsellPrice } = calculateUpsellPrice();

  return (
    <View
      border="base"
      background="subdued"
      cornerRadius="base"
      padding={["tight", "base", "base", "base"]}
    >
      <Text emphasis="bold">Bundle up and save</Text>
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
            <InlineStack spacing="tight">
              <Text accessibilityRole="deletion" appearance="subdued">
                {upsellCompareAtPrice}
              </Text>
              <Text>{upsellPrice}</Text>
            </InlineStack>
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
    const lineChanges: CartLineChange[] = [
      {
        type: "updateCartLine",
        id: firstLine.id,
        attributes: [
          {
            key: "_bundle_targets",
            value: "true",
          },
        ],
      },
      {
        type: "addCartLine",
        merchandiseId: recommendation.productVariant.id,
        quantity: 1,
        attributes: [
          {
            key: "_bundle_targets",
            value: "true",
          },
        ],
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

  function calculateUpsellPrice() {
    const upsellCompareAtAmount = Number(
      recommendation.productVariant.price.amount,
    );

    const asBundleCompareAtAmount =
      lines[0].cost.totalAmount.amount + upsellCompareAtAmount;

    const asBundleSavingsAmount =
      asBundleCompareAtAmount * (DEFAULT_PERCENTAGE_DECREASE / 100);

    return {
      upsellPrice: i18n.formatCurrency(
        upsellCompareAtAmount - asBundleSavingsAmount,
      ),
      upsellCompareAtPrice: i18n.formatCurrency(upsellCompareAtAmount),
    };
  }
}
