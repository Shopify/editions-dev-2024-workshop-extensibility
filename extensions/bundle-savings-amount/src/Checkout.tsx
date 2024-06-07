import {
  reactExtension,
  Text,
  BlockSpacer,
  Tag,
  useCartLineTarget,
  useLanguage,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />,
);

function Extension() {
  const target = useCartLineTarget();
  const lang = useLanguage();

  const savings = target.attributes.find(
    (attr) => attr.key === "_bundle_savings_amount",
  );
  if (!savings?.value) return null;

  const formattedSavings = new Intl.NumberFormat(lang.isoCode, {
    style: "currency",
    currency: target.cost.totalAmount.currencyCode,
  }).format(Number(savings.value));

  return (
    <>
      <BlockSpacer spacing="extraTight" />
      <Tag icon="discount">
        <Text appearance="subdued">Bundle savings ({formattedSavings})</Text>
      </Tag>
    </>
  );
}
