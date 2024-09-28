/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type AddExpenseInput = {
  amount: Scalars['Float']['input'];
  categoryId: Scalars['String']['input'];
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  label: Scalars['String']['input'];
};

export type AddGroupExpenseInput = {
  amount: Scalars['Float']['input'];
  categoryId: Scalars['String']['input'];
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  groupId: Scalars['String']['input'];
  label: Scalars['String']['input'];
  splits: Array<GroupExpenseSplitInput>;
};

export type CategoriesEntity = {
  __typename?: 'CategoriesEntity';
  expenses: Array<ExpensesEntity>;
  iconUrl: Scalars['String']['output'];
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type CreateGroupInput = {
  name: Scalars['String']['input'];
};

export type DeleteExpenseInput = {
  expenseId: Scalars['String']['input'];
};

export type DeleteGroupExpenseInput = {
  expenseId: Scalars['String']['input'];
};

export type ExpenseSplitsEntity = {
  __typename?: 'ExpenseSplitsEntity';
  borrowedAmount: Scalars['Float']['output'];
  expense: GroupExpensesEntity;
  expenseId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lentAmount: Scalars['Float']['output'];
  userId: Scalars['String']['output'];
  userProfile: UserProfilesEntity;
};

export type ExpensesByCategoryOutput = {
  __typename?: 'ExpensesByCategoryOutput';
  amount: Scalars['Float']['output'];
  categoryId: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type ExpensesEntity = {
  __typename?: 'ExpensesEntity';
  amount: Scalars['Float']['output'];
  category: CategoriesEntity;
  categoryId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  userProfile: UserProfilesEntity;
};

export type GetGroupExpenseInput = {
  expenseId: Scalars['String']['input'];
  groupId: Scalars['String']['input'];
};

export type GetGroupExpensesInput = {
  groupId: Scalars['String']['input'];
};

export type GetUserGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GroupExpenseSplitInput = {
  borrowedAmount: Scalars['Float']['input'];
  lentAmount: Scalars['Float']['input'];
  userId: Scalars['String']['input'];
};

export type GroupExpensesEntity = {
  __typename?: 'GroupExpensesEntity';
  amount: Scalars['Float']['output'];
  author: UserProfilesEntity;
  authorId: Scalars['String']['output'];
  borrowedAmount: Scalars['Float']['output'];
  category: CategoriesEntity;
  categoryId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  group: GroupsEntity;
  groupId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isLender: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  lentAmount: Scalars['Float']['output'];
  netBalance: Scalars['Float']['output'];
  splits: Array<ExpenseSplitsEntity>;
};

export type GroupsEntity = {
  __typename?: 'GroupsEntity';
  createdAt: Scalars['DateTime']['output'];
  expenses: Array<GroupExpensesEntity>;
  iconUrl: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  ownerId: Scalars['String']['output'];
  users: Array<UserProfilesEntity>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addExpense: ExpensesEntity;
  addGroupExpense: GroupExpensesEntity;
  createDefaultCategories: Array<CategoriesEntity>;
  createGroup: GroupsEntity;
  deleteExpense: Scalars['Boolean']['output'];
  deleteGroupExpense: Scalars['Boolean']['output'];
  updateExpense: ExpensesEntity;
  updateGroupExpense: GroupExpensesEntity;
  updateUserProfile: UserProfilesEntity;
};


export type MutationAddExpenseArgs = {
  input: AddExpenseInput;
};


export type MutationAddGroupExpenseArgs = {
  input: AddGroupExpenseInput;
};


export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};


export type MutationDeleteExpenseArgs = {
  input: DeleteExpenseInput;
};


export type MutationDeleteGroupExpenseArgs = {
  input: DeleteGroupExpenseInput;
};


export type MutationUpdateExpenseArgs = {
  input: UpdateExpenseInput;
};


export type MutationUpdateGroupExpenseArgs = {
  input: UpdateGroupExpenseInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserInput;
};

export type Query = {
  __typename?: 'Query';
  getCategories: Array<CategoriesEntity>;
  getExpenses: Array<ExpensesEntity>;
  getExpensesByCategory: Array<ExpensesByCategoryOutput>;
  getGroupExpense: GroupExpensesEntity;
  getGroupExpenses: Array<GroupExpensesEntity>;
  getTotalExpenses: Scalars['Float']['output'];
  getTotalGroupExpenses: Scalars['Float']['output'];
  getUserGroup: GroupsEntity;
  getUserGroups: Array<GroupsEntity>;
};


export type QueryGetGroupExpenseArgs = {
  input: GetGroupExpenseInput;
};


export type QueryGetGroupExpensesArgs = {
  input: GetGroupExpensesInput;
};


export type QueryGetTotalGroupExpensesArgs = {
  input: GetGroupExpensesInput;
};


export type QueryGetUserGroupArgs = {
  input: GetUserGroupInput;
};

export type UpdateExpenseInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  expenseId: Scalars['String']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGroupExpenseInput = {
  amount: Scalars['Float']['input'];
  categoryId: Scalars['String']['input'];
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  expenseId: Scalars['String']['input'];
  label: Scalars['String']['input'];
  splits: Array<GroupExpenseSplitInput>;
};

export type UpdateUserInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
};

export type UserProfilesEntity = {
  __typename?: 'UserProfilesEntity';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  expenses: Array<ExpensesEntity>;
  fullName: Scalars['String']['output'];
  groups: Array<GroupsEntity>;
  user: UsersEntity;
  userId: Scalars['String']['output'];
};

export type UsersEntity = {
  __typename?: 'UsersEntity';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isAdmin: Scalars['Boolean']['output'];
  password: Scalars['String']['output'];
  userProfile: UserProfilesEntity;
};

export type UpdateUserProfileMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserProfileMutation = { __typename?: 'Mutation', updateUserProfile: { __typename?: 'UserProfilesEntity', userId: string, fullName: string, avatarUrl?: string | null, user: { __typename?: 'UsersEntity', email: string } } };

export type AddExpenseMutationVariables = Exact<{
  input: AddExpenseInput;
}>;


export type AddExpenseMutation = { __typename?: 'Mutation', addExpense: { __typename?: 'ExpensesEntity', amount: number, id: string, label: string } };

export type AddGroupExpenseMutationVariables = Exact<{
  input: AddGroupExpenseInput;
}>;


export type AddGroupExpenseMutation = { __typename?: 'Mutation', addGroupExpense: { __typename?: 'GroupExpensesEntity', amount: number, id: string, label: string } };

export type DeleteExpenseMutationVariables = Exact<{
  input: DeleteExpenseInput;
}>;


export type DeleteExpenseMutation = { __typename?: 'Mutation', deleteExpense: boolean };

export type DeleteGroupExpenseMutationVariables = Exact<{
  input: DeleteGroupExpenseInput;
}>;


export type DeleteGroupExpenseMutation = { __typename?: 'Mutation', deleteGroupExpense: boolean };

export type CreateGroupMutationVariables = Exact<{
  input: CreateGroupInput;
}>;


export type CreateGroupMutation = { __typename?: 'Mutation', createGroup: { __typename?: 'GroupsEntity', createdAt: any, iconUrl: string, id: string, name: string, ownerId: string } };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'Query', getCategories: Array<{ __typename?: 'CategoriesEntity', id: string, label: string, iconUrl: string }> };

export type GetExpensesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExpensesQuery = { __typename?: 'Query', getTotalExpenses: number, getExpenses: Array<{ __typename?: 'ExpensesEntity', id: string, amount: number, label: string, createdAt: any, category: { __typename?: 'CategoriesEntity', id: string, label: string, iconUrl: string } }> };

export type GetUserGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserGroupsQuery = { __typename?: 'Query', getUserGroups: Array<{ __typename?: 'GroupsEntity', id: string, name: string, ownerId: string, iconUrl: string, createdAt: any, users: Array<{ __typename?: 'UserProfilesEntity', userId: string, fullName: string, avatarUrl?: string | null }> }> };

export type GetUserGroupQueryVariables = Exact<{
  input: GetUserGroupInput;
}>;


export type GetUserGroupQuery = { __typename?: 'Query', getUserGroup: { __typename?: 'GroupsEntity', id: string, name: string, iconUrl: string, createdAt: any, users: Array<{ __typename?: 'UserProfilesEntity', userId: string, fullName: string, avatarUrl?: string | null }> } };

export type GetGroupExpensesQueryVariables = Exact<{
  input: GetGroupExpensesInput;
}>;


export type GetGroupExpensesQuery = { __typename?: 'Query', getTotalGroupExpenses: number, getGroupExpenses: Array<{ __typename?: 'GroupExpensesEntity', amount: number, categoryId: string, createdAt: any, groupId: string, id: string, label: string, lentAmount: number, borrowedAmount: number, netBalance: number, isLender: boolean, category: { __typename?: 'CategoriesEntity', id: string, label: string, iconUrl: string }, splits: Array<{ __typename?: 'ExpenseSplitsEntity', userId: string, lentAmount: number, borrowedAmount: number, userProfile: { __typename?: 'UserProfilesEntity', userId: string, fullName: string, avatarUrl?: string | null } }> }> };

export type GetGroupExpenseQueryVariables = Exact<{
  input: GetGroupExpenseInput;
}>;


export type GetGroupExpenseQuery = { __typename?: 'Query', getGroupExpense: { __typename?: 'GroupExpensesEntity', amount: number, categoryId: string, createdAt: any, groupId: string, id: string, label: string, splits: Array<{ __typename?: 'ExpenseSplitsEntity', id: string, userId: string, userProfile: { __typename?: 'UserProfilesEntity', fullName: string, avatarUrl?: string | null, userId: string } }>, category: { __typename?: 'CategoriesEntity', iconUrl: string, id: string, label: string } } };

export type GetExpensesByCategoryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExpensesByCategoryQuery = { __typename?: 'Query', getExpensesByCategory: Array<{ __typename?: 'ExpensesByCategoryOutput', amount: number, categoryId: string, label: string }> };


export const UpdateUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const AddExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<AddExpenseMutation, AddExpenseMutationVariables>;
export const AddGroupExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddGroupExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddGroupExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addGroupExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<AddGroupExpenseMutation, AddGroupExpenseMutationVariables>;
export const DeleteExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DeleteExpenseMutation, DeleteExpenseMutationVariables>;
export const DeleteGroupExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteGroupExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteGroupExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGroupExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DeleteGroupExpenseMutation, DeleteGroupExpenseMutationVariables>;
export const CreateGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}}]}}]}}]} as unknown as DocumentNode<CreateGroupMutation, CreateGroupMutationVariables>;
export const GetCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}}]}}]} as unknown as DocumentNode<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const GetExpensesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExpenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getExpenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getTotalExpenses"}}]}}]} as unknown as DocumentNode<GetExpensesQuery, GetExpensesQueryVariables>;
export const GetUserGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUserGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetUserGroupsQuery, GetUserGroupsQueryVariables>;
export const GetUserGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetUserGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUserGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetUserGroupQuery, GetUserGroupQueryVariables>;
export const GetGroupExpensesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGroupExpenses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetGroupExpensesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getGroupExpenses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"splits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"borrowedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"lentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"borrowedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"netBalance"}},{"kind":"Field","name":{"kind":"Name","value":"isLender"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getTotalGroupExpenses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<GetGroupExpensesQuery, GetGroupExpensesQueryVariables>;
export const GetGroupExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGroupExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetGroupExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getGroupExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"splits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]}}]} as unknown as DocumentNode<GetGroupExpenseQuery, GetGroupExpenseQueryVariables>;
export const GetExpensesByCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExpensesByCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getExpensesByCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<GetExpensesByCategoryQuery, GetExpensesByCategoryQueryVariables>;