import {
  reactExtension,
  Text,
  Icon,
  InlineLayout,
  BlockSpacer,
  useCartLineTarget,
  useLanguage,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />,
);

// TODO: get this off of the bundle parent somehow
const DEFAULT_PERCENTAGE_DECREASE = 15;

function Extension() {
  const target = useCartLineTarget();
  const lang = useLanguage();

  const inverseDiscount = 1 - DEFAULT_PERCENTAGE_DECREASE / 100;

  const originalPrice = target.cost.totalAmount.amount / inverseDiscount;
  const difference = target.cost.totalAmount.amount - originalPrice;

  if (difference >= 0 || target.lineComponents.length === 0) return null;

  const formattedSavings = new Intl.NumberFormat(lang.isoCode, {
    style: "currency",
    currency: target.cost.totalAmount.currencyCode,
  }).format(difference);

  return (
    <>
      <BlockSpacer spacing="extraTight" />
      <InlineLayout blockAlignment="center" columns="auto" spacing="extraTight">
        <Icon size="small" source="discount" />
        <Text size="small" appearance="subdued">
          Bundle savings ({formattedSavings})
        </Text>
      </InlineLayout>
    </>
  );
}
