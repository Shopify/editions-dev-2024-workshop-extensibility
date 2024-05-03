import { useEffect } from "react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit, useLoaderData } from "@remix-run/react";

import { authenticate } from "../shopify.server";

import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  Button,
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
      query getProductIdFromHandle($handle: String!) {
          productByHandle(handle: $handle) {
            id
            variants(first: 10) {
                nodes{
                  id
                }
            }
        }
      }`,
    {
      variables: {
          handle: `snowboard-bundle`
      },
    },
  );
  const responseJson = await response.json();

  return json({
    variantID: responseJson!.data!.productByHandle?.variants.nodes[0].id
  });
};

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  // First return says if the extension exists and metafield is set, just print the data
  const doesFunctionExistResponse = await admin.graphql(
    `#graphql
      query {
        cartTransforms(first: 5) {
          nodes {
            blockOnFailure
            functionId
            id
            metafield(namespace: "custom", key: "bundle_parent"){
              value
            }
          }
        }
      }`,
  );
  const functionExistJson = await doesFunctionExistResponse.json();

  if (functionExistJson.data.cartTransforms?.nodes[0]?.metafield != null) {
    return json({
      functionDetails: functionExistJson.data.cartTransforms.nodes[0],
    });
  }

  
  const productIdResponse = await admin.graphql(
    `#graphql
      query getProductIdFromHandle($handle: String!) {
          productByHandle(handle: $handle) {
            id
            variants(first: 10) {
                nodes{
                  id
                }
            }
        }
      }`,
    {
      variables: {
          handle: `snowboard-bundle`
      },
    },
  );
  const productIdResponseJson = await productIdResponse.json();
  const productVariantId = productIdResponseJson!.data!.productByHandle?.variants.nodes[0].id;
  // Second return says if the extension exists but metafield is not set, add the metafield then print the data
  if (functionExistJson.data.cartTransforms?.nodes[0]?.metafield === null) {
    const metafieldSetResponse = await admin.graphql(
      `#graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              "key": "bundle_parent",
              "namespace": "custom",
              "ownerId": functionExistJson.data.cartTransforms.nodes[0].id,
              "type": "variant_reference",
              "value": productVariantId
            }
          ]
        },
      },
    );

    const metafieldJson = await metafieldSetResponse.json();

    return json({
      functionDetails: functionExistJson.data.cartTransforms.nodes[0],
      newMetafield: metafieldJson.data,
    });
  }

  // Last return says if the extension doesn't exist, create it, then set metafield, then return both
  const response = await admin.graphql(
    `#graphql
      query {
        shopifyFunctions(first: 25) {
          nodes {
            app {
              title
            }
            apiType
            title
            id
          }
        }
      }`,
  );
  const functionJson = await response.json();
  const functionId = functionJson.data.shopifyFunctions.nodes[0].id;
  const functionCreateResponse = await admin.graphql(
    `#graphql
    mutation cartTransformCreate($functionId: String!){
      cartTransformCreate(
        functionId: $functionId
        blockOnFailure: false # Determines if function failures should block buyers from checking out
      ) {
        cartTransform {
          id
          functionId
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        functionId: functionId,
      },
    },
  );
  const functionCreateJson = await functionCreateResponse.json();

  const metafieldSetResponse = await admin.graphql(
    `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          key
          namespace
          value
          createdAt
          updatedAt
        }
        userErrors {
          field
          message
          code
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            "key": "bundle_parent",
            "namespace": "custom",
            "ownerId": functionCreateJson.data.cartTransformCreate.cartTransform.id,
            "type": "variant_reference",
            "value": productVariantId 
          }
        ]
      },
    },
  );
  const metafieldJson = await metafieldSetResponse.json();
  return json({
    newFunction: functionCreateJson.data.cartTransformCreate,
    newMetafield: metafieldJson.data,
  });
};

export default function FunctionManagement() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  
  const productVariantId = loaderData?.variantID;
  const getFunctionId = () => submit({productVariantId: productVariantId}, { method: "POST" });
  
  if (!productVariantId){
    return (
      <Page>
        <>
          <Text as="h2">Please go back and create a bundle product first on the main page</Text>
        </>
      </Page>
    );
  }
  return (
    <Page>
      <ui-title-bar title="Function Management" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Button loading={isLoading} onClick={getFunctionId}>
                Initiate GO TIME
              </Button>
              {actionData?.functionDetails && !actionData?.newMetafield && (
                <>
                  <Text>Function already exists, printing function data:</Text>
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                    overflowX="scroll"
                  >
                    <pre style={{ margin: 0 }}>
                      <code>
                        {JSON.stringify(actionData.functionDetails, null, 2)}
                      </code>
                    </pre>
                  </Box>
                </>
              )}
              {actionData?.functionDetails && actionData?.newMetafield && (
                <>
                  <Text>Function already exists, new metafield added:</Text>
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                    overflowX="scroll"
                  >
                    <pre style={{ margin: 0 }}>
                      <code>
                        {JSON.stringify(actionData.functionDetails, null, 2)}
                      </code>
                    </pre>
                  </Box>
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                    overflowX="scroll"
                  >
                    <pre style={{ margin: 0 }}>
                      <code>
                        {JSON.stringify(actionData.newMetafield, null, 2)}
                      </code>
                    </pre>
                  </Box>
                </>
              )}
              {actionData?.newFunction && actionData?.newMetafield && (
                <>
                  <Text>
                    New extension created, printing function extension and new
                    metafield
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
                      <code>
                        {JSON.stringify(actionData.newFunction, null, 2)}
                      </code>
                    </pre>
                  </Box>
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                    overflowX="scroll"
                  >
                    <pre style={{ margin: 0 }}>
                      <code>
                        {JSON.stringify(actionData.newMetafield, null, 2)}
                      </code>
                    </pre>
                  </Box>
                </>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Resources
              </Text>
              <List>
                <List.Item>
                  <Link
                    url="https://shopify.dev"
                    target="_blank"
                    removeUnderline
                  >
                    add more links here
                  </Link>
                </List.Item>
                <List.Item>
                  <Link
                    url="https://shopify.dev"
                    target="_blank"
                    removeUnderline
                  >
                    add more links here
                  </Link>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
