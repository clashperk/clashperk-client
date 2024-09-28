import { graphql } from './generated';

export const UPDATE_USER_MUTATION = graphql(`
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUserProfile(input: $input) {
      userId
      fullName
      avatarUrl
      user {
        email
      }
    }
  }
`);

export const ADD_EXPENSE_MUTATION = graphql(`
  mutation AddExpense($input: AddExpenseInput!) {
    addExpense(input: $input) {
      amount
      id
      label
    }
  }
`);

export const ADD_GROUP_EXPENSE_MUTATION = graphql(`
  mutation AddGroupExpense($input: AddGroupExpenseInput!) {
    addGroupExpense(input: $input) {
      amount
      id
      label
    }
  }
`);

export const DELETE_EXPENSE_MUTATION = graphql(`
  mutation DeleteExpense($input: DeleteExpenseInput!) {
    deleteExpense(input: $input)
  }
`);

export const DELETE_GROUP_EXPENSE_MUTATION = graphql(`
  mutation DeleteGroupExpense($input: DeleteGroupExpenseInput!) {
    deleteGroupExpense(input: $input)
  }
`);

export const CREATE_GROUP_MUTATION = graphql(`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      createdAt
      iconUrl
      id
      name
      ownerId
    }
  }
`);
