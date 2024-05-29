import { useEffect } from "react";
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

import { useBootstrapContext } from "~/context/dynamic-bundles";

const cartTranformQuery = `#graphql
  query CartTransform {
    cartTransforms(first: 5) {
      nodes {
        functionId
        id
        metafield(namespace: "custom", key: "bundle_parent"){
          value
        }
      }
    }
  }`;

const shopifyFunctionsQuery = `#graphql
  query ShopifyFunctions {
    shopifyFunctions(first: 25) {
      nodes {
        apiType
        id
      }
    }
  }`;

const cartTranformCreateMutation = `#graphql
  mutation CartTransformCreate($functionId: String!) {
    cartTransformCreate(
      functionId: $functionId
      blockOnFailure: false
    ) {
      cartTransform {
        id
        functionId
        metafield(namespace: "custom", key: "bundle_parent"){
          value
        }
      }
      userErrors {
        message
        field
        code
      }
    }
  }`;

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const { data: cartTransformData } = await admin
    .graphql(cartTranformQuery)
    .then((res) => res.json());

  if (cartTransformData?.cartTransforms.nodes[0]) {
    return json({
      type: "success",
      cartTransform: cartTransformData.cartTransforms.nodes[0],
    });
  }

  const { data: shopifyFunctionsData } = await admin
    .graphql(shopifyFunctionsQuery)
    .then((res) => res.json());

  if (!shopifyFunctionsData?.shopifyFunctions?.nodes?.length) {
    return {
      type: "error",
      errors: [
        {
          message: "no functions found",
        },
      ],
    };
  }

  const firstTransform = shopifyFunctionsData.shopifyFunctions.nodes.find(
    (shopifyFunction: any) => shopifyFunction.apiType === "cart_transform",
  );

  if (!firstTransform) {
    return {
      type: "error",
      errors: [
        {
          message: "no cart transforms installed",
        },
      ],
    };
  }

  const { data: transformCreateData } = await admin
    .graphql(cartTranformCreateMutation, {
      variables: {
        functionId: firstTransform.id,
      },
    })
    .then((res) => res.json());

  if (!transformCreateData?.cartTransformCreate) {
    return {
      type: "error",
      errors: [
        {
          message: "failed to fetch",
        },
      ],
    };
  }

  if (transformCreateData.cartTransformCreate.userErrors.length) {
    return {
      type: "error",
      errors: transformCreateData.cartTransformCreate.userErrors,
    };
  }

  return json({
    type: "success",
    cartTransform: transformCreateData.cartTransformCreate.cartTransform,
  });
}

export default function TransformFunction() {
  const loaderData = useLoaderData<typeof loader>();
  const { setCartTransformId, bundleProductId } = useBootstrapContext();

  useEffect(() => {
    if ("cartTransform" in loaderData) {
      setCartTransformId(loaderData.cartTransform.id);
    }
  }, [loaderData, setCartTransformId]);

  return (
    <Layout.Section>
      <Card>
        <BlockStack gap="500">
          {loaderData && (
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Cart transform function extension details
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
                Finally, let’s create the metafield
              </Text>
            </BlockStack>
          )}

          <InlineStack gap="300">
            <Button
              disabled={!loaderData}
              url={`/dynamic-bundles/metafield-set?bundleProductId=${bundleProductId}&cartTransformId=${loaderData?.cartTransform?.id}`}
            >
              Set the product as a metafield
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>
    </Layout.Section>
  );
}
