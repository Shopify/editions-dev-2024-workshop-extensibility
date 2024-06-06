import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
} from "@shopify/polaris";

const metafieldsSetMutation = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
      }
      userErrors {
        field
        message
        code
      }
    }
  }`;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const bundleProductGid = url.searchParams.get("bundleProductId");
  const cartTransformGid = url.searchParams.get("cartTransformId");

  if (!bundleProductGid || !cartTransformGid) {
    return json({
      type: "error",
      message: "params not specified",
    });
  }

  const { admin } = await authenticate.admin(request);

  const { data } = await admin
    .graphql(metafieldsSetMutation, {
      variables: {
        metafields: [
          {
            key: "bundle_parent",
            namespace: "custom",
            ownerId: cartTransformGid,
            type: "variant_reference",
            value: bundleProductGid,
          },
        ],
      },
    })
    .then((res) => res.json());

  if (!data?.metafieldsSet?.metafields?.length) {
    return {
      type: "error",
    };
  }

  if (data.metafieldsSet.userErrors.length) {
    return {
      type: "error",
      errors: data.metafieldsSet.userErrors,
    };
  }

  return json({ metafieldsSet: data.metafieldsSet.metafields });
}

export default function MetafieldSet() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Layout.Section>
      <Card>
        <BlockStack gap="500">
          {loaderData && (
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Cart transform metafield
              </Text>
              <Box
                padding="400"
                background="bg-surface-active"
                borderWidth="025"
                borderRadius="200"
                borderColor="border"
                overflowX="scroll"
              >
                <pre style={{ margin: 0 }}>
                  <code>{JSON.stringify(loaderData, null, 2)}</code>
                </pre>
              </Box>
              <Text variant="bodyMd" as="p">
                You’re done! 🎉
              </Text>
            </BlockStack>
          )}
          <InlineStack gap="300">
            <Button url={"/app"}>Back to app index</Button>
          </InlineStack>
        </BlockStack>
      </Card>
    </Layout.Section>
  );
}
