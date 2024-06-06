import type { LoaderFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { json } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";

import { Page, Layout, BlockStack } from "@shopify/polaris";

import { BootstrapContext } from "~/context/dynamic-bundles";

export const loader: LoaderFunction = async ({ request }) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export default function Bootstrap() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <Page>
        <ui-title-bar title="Dynamic bundles"></ui-title-bar>
        <BlockStack gap="500">
          <Layout>
            <BootstrapContext>
              <Outlet />
            </BootstrapContext>
          </Layout>
        </BlockStack>
      </Page>
    </AppProvider>
  );
}
