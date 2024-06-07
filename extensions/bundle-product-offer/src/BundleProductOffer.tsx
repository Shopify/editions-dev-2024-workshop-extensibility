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
  useApi,
  SkeletonImage,
  SkeletonText,
} from "@shopify/ui-extensions-react/checkout";
import type { CartLine } from "@shopify/ui-extensions/checkout";
import type { ProductVariant } from "@shopify/hydrogen/storefront-api-types";

interface ExtensionProps {
  recommendation: {
    productTitle: string;
    productVariant: ProductVariant;
  };
  firstLine?: CartLine;
}

const DEFAULT_PERCENTAGE_DECREASE = 15;

export function BundleProductOffer({
  recommendation,
  firstLine,
}: ExtensionProps) {
  const [adding, setAdding] = useState(false);
  const applyCartLinesChange = useApplyCartLinesChange();
  const { i18n } = useApi();

  const productPrice = i18n.formatCurrency(
    Number(recommendation.productVariant.price.amount),
  );

  const { productOfferCompareAtPrice, productOfferPrice } = calculatePricing();

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
          {recommendation.productVariant.image && (
            <Image
              cornerRadius="base"
              accessibilityDescription={
                recommendation.productVariant.image.altText || ""
              }
              source={recommendation.productVariant.image.url}
            />
          )}
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
          <Button loading={adding} disabled={adding} onPress={handleAddToCart}>
            Add
          </Button>
        </View>
      </InlineLayout>
    </View>
  );

  async function handleAddToCart() {
    setAdding(true);
    const result = await applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: recommendation.productVariant.id,
      quantity: 1,
      attributes: [
        {
          key: "_bundle_with",
          value: firstLine.id,
        },
      ],
    });
    if (result.type === "error") {
      console.error(result.message);
    }
    setAdding(false);
  }

  function calculatePricing() {
    const productOfferCompareAtAmount = Number(
      recommendation.productVariant.price.amount,
    );

    const asBundleCompareAtAmount =
      firstLine.cost.totalAmount.amount / firstLine.quantity +
      productOfferCompareAtAmount;

    const asBundleSavingsAmount =
      asBundleCompareAtAmount * (DEFAULT_PERCENTAGE_DECREASE / 100);

    return {
      productOfferPrice: i18n.formatCurrency(
        productOfferCompareAtAmount - asBundleSavingsAmount,
      ),
      productOfferCompareAtPrice: i18n.formatCurrency(
        productOfferCompareAtAmount,
      ),
    };
  }
}

export function BundleProductOfferSkeleton() {
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
          <SkeletonImage inlineSize={64} blockSize={64} />
          <BlockLayout rows={["20%", 22]}>
            <BlockSpacer />
            <SkeletonText inlineSize="base" />
            <SkeletonText />
          </BlockLayout>
        </InlineStack>
        <View maxBlockSize={10} minInlineSize="25%" inlineAlignment="end">
          <Button disabled={true}>Add</Button>
        </View>
      </InlineLayout>
    </View>
  );
}
