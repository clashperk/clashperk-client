/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  mutation UpdateUserProfile($input: UpdateUserInput!) {\n    updateUserProfile(input: $input) {\n      userId\n      fullName\n      avatarUrl\n      user {\n        email\n      }\n    }\n  }\n": types.UpdateUserProfileDocument,
    "\n  mutation AddExpense($input: AddExpenseInput!) {\n    addExpense(input: $input) {\n      amount\n      id\n      label\n    }\n  }\n": types.AddExpenseDocument,
    "\n  mutation AddGroupExpense($input: AddGroupExpenseInput!) {\n    addGroupExpense(input: $input) {\n      amount\n      id\n      label\n    }\n  }\n": types.AddGroupExpenseDocument,
    "\n  mutation DeleteExpense($input: DeleteExpenseInput!) {\n    deleteExpense(input: $input)\n  }\n": types.DeleteExpenseDocument,
    "\n  mutation DeleteGroupExpense($input: DeleteGroupExpenseInput!) {\n    deleteGroupExpense(input: $input)\n  }\n": types.DeleteGroupExpenseDocument,
    "\n  mutation CreateGroup($input: CreateGroupInput!) {\n    createGroup(input: $input) {\n      createdAt\n      iconUrl\n      id\n      name\n      ownerId\n    }\n  }\n": types.CreateGroupDocument,
    "\n  query GetCategories {\n    getCategories {\n      id\n      label\n      iconUrl\n    }\n  }\n": types.GetCategoriesDocument,
    "\n  query GetExpenses {\n    getExpenses {\n      id\n      amount\n      label\n      category {\n        id\n        label\n        iconUrl\n      }\n      createdAt\n    }\n    getTotalExpenses\n  }\n": types.GetExpensesDocument,
    "\n  query GetUserGroups {\n    getUserGroups {\n      id\n      name\n      ownerId\n      iconUrl\n      users {\n        userId\n        fullName\n        avatarUrl\n      }\n      createdAt\n    }\n  }\n": types.GetUserGroupsDocument,
    "\n  query GetUserGroup($input: GetUserGroupInput!) {\n    getUserGroup(input: $input) {\n      id\n      name\n      users {\n        userId\n        fullName\n        avatarUrl\n      }\n      iconUrl\n      createdAt\n    }\n  }\n": types.GetUserGroupDocument,
    "\n  query GetGroupExpenses($input: GetGroupExpensesInput!) {\n    getGroupExpenses(input: $input) {\n      amount\n      categoryId\n      createdAt\n      groupId\n      id\n      category {\n        id\n        label\n        iconUrl\n      }\n      splits {\n        userId\n        userProfile {\n          userId\n          fullName\n          avatarUrl\n        }\n        lentAmount\n        borrowedAmount\n      }\n      label\n      lentAmount\n      borrowedAmount\n      netBalance\n      isLender\n    }\n    getTotalGroupExpenses(input: $input)\n  }\n": types.GetGroupExpensesDocument,
    "\n  query GetGroupExpense($input: GetGroupExpenseInput!) {\n    getGroupExpense(input: $input) {\n      amount\n      categoryId\n      createdAt\n      groupId\n      id\n      label\n      splits {\n        id\n        userId\n        userProfile {\n          fullName\n          avatarUrl\n          userId\n        }\n      }\n      category {\n        iconUrl\n        id\n        label\n      }\n    }\n  }\n": types.GetGroupExpenseDocument,
    "\n  query GetExpensesByCategory {\n    getExpensesByCategory {\n      amount\n      categoryId\n      label\n    }\n  }\n": types.GetExpensesByCategoryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUserProfile($input: UpdateUserInput!) {\n    updateUserProfile(input: $input) {\n      userId\n      fullName\n      avatarUrl\n      user {\n        email\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUserProfile($input: UpdateUserInput!) {\n    updateUserProfile(input: $input) {\n      userId\n      fullName\n      avatarUrl\n      user {\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddExpense($input: AddExpenseInput!) {\n    addExpense(input: $input) {\n      amount\n      id\n      label\n    }\n  }\n"): (typeof documents)["\n  mutation AddExpense($input: AddExpenseInput!) {\n    addExpense(input: $input) {\n      amount\n      id\n      label\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddGroupExpense($input: AddGroupExpenseInput!) {\n    addGroupExpense(input: $input) {\n      amount\n      id\n      label\n    }\n  }\n"): (typeof documents)["\n  mutation AddGroupExpense($input: AddGroupExpenseInput!) {\n    addGroupExpense(input: $input) {\n      amount\n      id\n      label\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteExpense($input: DeleteExpenseInput!) {\n    deleteExpense(input: $input)\n  }\n"): (typeof documents)["\n  mutation DeleteExpense($input: DeleteExpenseInput!) {\n    deleteExpense(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteGroupExpense($input: DeleteGroupExpenseInput!) {\n    deleteGroupExpense(input: $input)\n  }\n"): (typeof documents)["\n  mutation DeleteGroupExpense($input: DeleteGroupExpenseInput!) {\n    deleteGroupExpense(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateGroup($input: CreateGroupInput!) {\n    createGroup(input: $input) {\n      createdAt\n      iconUrl\n      id\n      name\n      ownerId\n    }\n  }\n"): (typeof documents)["\n  mutation CreateGroup($input: CreateGroupInput!) {\n    createGroup(input: $input) {\n      createdAt\n      iconUrl\n      id\n      name\n      ownerId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCategories {\n    getCategories {\n      id\n      label\n      iconUrl\n    }\n  }\n"): (typeof documents)["\n  query GetCategories {\n    getCategories {\n      id\n      label\n      iconUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetExpenses {\n    getExpenses {\n      id\n      amount\n      label\n      category {\n        id\n        label\n        iconUrl\n      }\n      createdAt\n    }\n    getTotalExpenses\n  }\n"): (typeof documents)["\n  query GetExpenses {\n    getExpenses {\n      id\n      amount\n      label\n      category {\n        id\n        label\n        iconUrl\n      }\n      createdAt\n    }\n    getTotalExpenses\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserGroups {\n    getUserGroups {\n      id\n      name\n      ownerId\n      iconUrl\n      users {\n        userId\n        fullName\n        avatarUrl\n      }\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetUserGroups {\n    getUserGroups {\n      id\n      name\n      ownerId\n      iconUrl\n      users {\n        userId\n        fullName\n        avatarUrl\n      }\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserGroup($input: GetUserGroupInput!) {\n    getUserGroup(input: $input) {\n      id\n      name\n      users {\n        userId\n        fullName\n        avatarUrl\n      }\n      iconUrl\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetUserGroup($input: GetUserGroupInput!) {\n    getUserGroup(input: $input) {\n      id\n      name\n      users {\n        userId\n        fullName\n        avatarUrl\n      }\n      iconUrl\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGroupExpenses($input: GetGroupExpensesInput!) {\n    getGroupExpenses(input: $input) {\n      amount\n      categoryId\n      createdAt\n      groupId\n      id\n      category {\n        id\n        label\n        iconUrl\n      }\n      splits {\n        userId\n        userProfile {\n          userId\n          fullName\n          avatarUrl\n        }\n        lentAmount\n        borrowedAmount\n      }\n      label\n      lentAmount\n      borrowedAmount\n      netBalance\n      isLender\n    }\n    getTotalGroupExpenses(input: $input)\n  }\n"): (typeof documents)["\n  query GetGroupExpenses($input: GetGroupExpensesInput!) {\n    getGroupExpenses(input: $input) {\n      amount\n      categoryId\n      createdAt\n      groupId\n      id\n      category {\n        id\n        label\n        iconUrl\n      }\n      splits {\n        userId\n        userProfile {\n          userId\n          fullName\n          avatarUrl\n        }\n        lentAmount\n        borrowedAmount\n      }\n      label\n      lentAmount\n      borrowedAmount\n      netBalance\n      isLender\n    }\n    getTotalGroupExpenses(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGroupExpense($input: GetGroupExpenseInput!) {\n    getGroupExpense(input: $input) {\n      amount\n      categoryId\n      createdAt\n      groupId\n      id\n      label\n      splits {\n        id\n        userId\n        userProfile {\n          fullName\n          avatarUrl\n          userId\n        }\n      }\n      category {\n        iconUrl\n        id\n        label\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetGroupExpense($input: GetGroupExpenseInput!) {\n    getGroupExpense(input: $input) {\n      amount\n      categoryId\n      createdAt\n      groupId\n      id\n      label\n      splits {\n        id\n        userId\n        userProfile {\n          fullName\n          avatarUrl\n          userId\n        }\n      }\n      category {\n        iconUrl\n        id\n        label\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetExpensesByCategory {\n    getExpensesByCategory {\n      amount\n      categoryId\n      label\n    }\n  }\n"): (typeof documents)["\n  query GetExpensesByCategory {\n    getExpensesByCategory {\n      amount\n      categoryId\n      label\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;