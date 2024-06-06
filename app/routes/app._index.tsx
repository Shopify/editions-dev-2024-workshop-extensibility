import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useNavigation,
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
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  return null;
};

export default function Index() {
  const nav = useNavigation();
  const navigate = useNavigate();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

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
                    loading={isLoading}
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
