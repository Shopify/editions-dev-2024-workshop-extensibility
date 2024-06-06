import { useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { authenticate } from "../shopify.server";

import {
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
} from "@shopify/polaris";

import { useBootstrapContext } from "~/context/dynamic-bundles";

const productFromHandleQuery = `#graphql
  query GetProductIdFromHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      images(first:5){
          nodes{
            url
          }
      }
      variants(first: 10) {
        nodes {
          title
          id
        }
      }
    }
  }
`;

const bundleCreateProductMutation = `#graphql
  mutation CreateBundleParentProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
    productCreate(input: $input, media: $media) {
      product {
        id
        title
        handle
        status
        productPublications(first:5){
          nodes{
            channel{
              id
              handle
            }
          }              
        }
        variants(first: 1) {
            nodes {
              id
              title
            }
        }
      }
      userErrors {
        message
        field
      }
    }
  }
`;

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const response = await admin
    .graphql(productFromHandleQuery, {
      variables: {
        handle: "snowboard-bundle",
      },
    })
    .then((res) => res.json());

  if (response?.data?.productByHandle?.variants?.nodes.length) {
    return json({
      type: "success",
      product: response.data.productByHandle,
    });
  }

  const creation = await admin
    .graphql(bundleCreateProductMutation, {
      variables: {
        input: {
          title: `Snowboard bundle container`,
          handle: `snowboard-bundle`,
          claimOwnership: { bundles: true },
          productPublications: [
            {
              channelHandle: `online_store`
            }
          ]
        },
        media: [{
          mediaContentType: `IMAGE`,
          originalSource: `https://cdn.shopify.com/s/files/1/0789/6259/0008/files/Snowboard_bundle.png?v=1717692544`
        }]
      },
    })
    .then((res) => res.json());

  if (!creation.data?.productCreate?.product) {
    return json({
      type: "error",
      message: "failed to fetch",
    });
  }

  if (creation.data.productCreate?.userErrors?.length) {
    return json({
      type: "error",
      errors: creation.data.productCreate.userErrors,
    });
  }

  return json({
    type: "success",
    product: creation.data.productCreate.product,
  });
}

export default function ProductBundle() {
  const loaderData = useLoaderData<typeof loader>();
  const { setBundleProductId } = useBootstrapContext();

  useEffect(() => {
    if (loaderData.type === "success" && "product" in loaderData) {
      setBundleProductId(loaderData.product.variants.nodes[0].id);
    }
  }, [loaderData, setBundleProductId]);

  return (
    <Layout.Section>
      <Card>
        <BlockStack gap="500">
          {loaderData && (
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Bundle product details
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
                Next, let’s activate the cart transform function extension.
              </Text>
            </BlockStack>
          )}
          <InlineStack gap="300">
            <Button
              url="/dynamic-bundles/transform-function"
              disabled={!loaderData}
            >
              Activate Function
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>
    </Layout.Section>
  );
}
