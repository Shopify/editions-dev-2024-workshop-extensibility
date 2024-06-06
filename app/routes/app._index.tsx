import {
  useNavigate,
} from "@remix-run/react";

import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  List,
  InlineStack,
} from "@shopify/polaris";

export default function Index() {
  const navigate = useNavigate();
  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Get started with bundles
                  </Text>
                  <Text as="p" variant="bodyMd">
                    To create an extension that uses bundles, we need to follow
                    these steps: </Text>
                    <List type="number">
                      <List.Item>Generate the product bundle</List.Item>
                      <List.Item>
                        Activate the cart transform function extension
                      </List.Item>
                      <List.Item>
                        Set the generated product as a metafield
                      </List.Item>
                    </List>
                </BlockStack>
                <InlineStack gap="300">
                  <Button
                    onClick={() => {
                      navigate("/dynamic-bundles/bundle-product");
                    }}
                  >
                    Generate a bundle parent product
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
