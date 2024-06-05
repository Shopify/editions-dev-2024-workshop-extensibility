/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as AdminTypes from './admin.types.d.ts';

export type PopulateProductMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.ProductInput;
}>;


export type PopulateProductMutation = { productCreate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status'>
      & { variants: { edges: Array<{ node: Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'> }> } }
    )> }> };

export type ShopifyRemixTemplateUpdateVariantMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.ProductVariantInput;
}>;


export type ShopifyRemixTemplateUpdateVariantMutation = { productVariantUpdate?: AdminTypes.Maybe<{ productVariant?: AdminTypes.Maybe<Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'>> }> };

export type GetProductIdFromHandleQueryVariables = AdminTypes.Exact<{
  handle: AdminTypes.Scalars['String']['input'];
}>;


export type GetProductIdFromHandleQuery = { productByHandle?: AdminTypes.Maybe<(
    Pick<AdminTypes.Product, 'id' | 'title' | 'handle'>
    & { variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'title' | 'id'>> } }
  )> };

export type CreateBundleParentProductMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.ProductInput;
}>;


export type CreateBundleParentProductMutation = { productCreate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status'>
      & { variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id' | 'title'>> } }
    )>, userErrors: Array<Pick<AdminTypes.UserError, 'message' | 'field'>> }> };

export type MetafieldsSetMutationVariables = AdminTypes.Exact<{
  metafields: Array<AdminTypes.MetafieldsSetInput> | AdminTypes.MetafieldsSetInput;
}>;


export type MetafieldsSetMutation = { metafieldsSet?: AdminTypes.Maybe<{ metafields?: AdminTypes.Maybe<Array<Pick<AdminTypes.Metafield, 'key' | 'namespace' | 'value'>>>, userErrors: Array<Pick<AdminTypes.MetafieldsSetUserError, 'field' | 'message' | 'code'>> }> };

export type CartTransformQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type CartTransformQuery = { cartTransforms: { nodes: Array<(
      Pick<AdminTypes.CartTransform, 'functionId' | 'id'>
      & { metafield?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'value'>> }
    )> } };

export type ShopifyFunctionsQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type ShopifyFunctionsQuery = { shopifyFunctions: { nodes: Array<Pick<AdminTypes.ShopifyFunction, 'apiType' | 'id'>> } };

export type CartTransformCreateMutationVariables = AdminTypes.Exact<{
  functionId: AdminTypes.Scalars['String']['input'];
}>;


export type CartTransformCreateMutation = { cartTransformCreate?: AdminTypes.Maybe<{ cartTransform?: AdminTypes.Maybe<(
      Pick<AdminTypes.CartTransform, 'id' | 'functionId'>
      & { metafield?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'value'>> }
    )>, userErrors: Array<Pick<AdminTypes.CartTransformCreateUserError, 'message' | 'field' | 'code'>> }> };

interface GeneratedQueryTypes {
  "#graphql\n  query GetProductIdFromHandle($handle: String!) {\n    productByHandle(handle: $handle) {\n      id\n      title\n      handle\n      variants(first: 10) {\n        nodes {\n          title\n          id\n        }\n      }\n    }\n  }\n": {return: GetProductIdFromHandleQuery, variables: GetProductIdFromHandleQueryVariables},
  "#graphql\n  query CartTransform {\n    cartTransforms(first: 5) {\n      nodes {\n        functionId\n        id\n        metafield(namespace: \"custom\", key: \"bundle_parent\"){\n          value\n        }\n      }\n    }\n  }": {return: CartTransformQuery, variables: CartTransformQueryVariables},
  "#graphql\n  query ShopifyFunctions {\n    shopifyFunctions(first: 25) {\n      nodes {\n        apiType\n        id\n      }\n    }\n  }": {return: ShopifyFunctionsQuery, variables: ShopifyFunctionsQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n      mutation populateProduct($input: ProductInput!) {\n        productCreate(input: $input) {\n          product {\n            id\n            title\n            handle\n            status\n            variants(first: 10) {\n              edges {\n                node {\n                  id\n                  price\n                  barcode\n                  createdAt\n                }\n              }\n            }\n          }\n        }\n      }": {return: PopulateProductMutation, variables: PopulateProductMutationVariables},
  "#graphql\n      mutation shopifyRemixTemplateUpdateVariant($input: ProductVariantInput!) {\n        productVariantUpdate(input: $input) {\n          productVariant {\n            id\n            price\n            barcode\n            createdAt\n          }\n        }\n      }": {return: ShopifyRemixTemplateUpdateVariantMutation, variables: ShopifyRemixTemplateUpdateVariantMutationVariables},
  "#graphql\n  mutation CreateBundleParentProduct($input: ProductInput!) {\n    productCreate(input: $input) {\n      product {\n        id\n        title\n        handle\n        status\n        variants(first: 1) {\n            nodes {\n              id\n              title\n            }\n        }\n      }\n      userErrors {\n        message\n        field\n      }\n    }\n  }\n": {return: CreateBundleParentProductMutation, variables: CreateBundleParentProductMutationVariables},
  "#graphql\n  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {\n    metafieldsSet(metafields: $metafields) {\n      metafields {\n        key\n        namespace\n        value\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n    }\n  }": {return: MetafieldsSetMutation, variables: MetafieldsSetMutationVariables},
  "#graphql\n  mutation CartTransformCreate($functionId: String!) {\n    cartTransformCreate(\n      functionId: $functionId\n      blockOnFailure: false\n    ) {\n      cartTransform {\n        id\n        functionId\n        metafield(namespace: \"custom\", key: \"bundle_parent\"){\n          value\n        }\n      }\n      userErrors {\n        message\n        field\n        code\n      }\n    }\n  }": {return: CartTransformCreateMutation, variables: CartTransformCreateMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
