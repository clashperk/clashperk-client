import { graphql } from './generated';

export const GET_CATEGORIES_QUERY = graphql(`
  query GetCategories {
    getCategories {
      id
      label
      iconUrl
    }
  }
`);

export const GET_EXPENSES_QUERY = graphql(`
  query GetExpenses {
    getExpenses {
      id
      amount
      label
      category {
        id
        label
        iconUrl
      }
      createdAt
    }
    getTotalExpenses
  }
`);

export const GET_USER_GROUPS_QUERY = graphql(`
  query GetUserGroups {
    getUserGroups {
      id
      name
      ownerId
      iconUrl
      users {
        userId
        fullName
        avatarUrl
      }
      createdAt
    }
  }
`);

export const GET_USER_GROUP_QUERY = graphql(`
  query GetUserGroup($input: GetUserGroupInput!) {
    getUserGroup(input: $input) {
      id
      name
      users {
        userId
        fullName
        avatarUrl
      }
      iconUrl
      createdAt
    }
  }
`);

export const GET_GROUP_EXPENSES_QUERY = graphql(`
  query GetGroupExpenses($input: GetGroupExpensesInput!) {
    getGroupExpenses(input: $input) {
      amount
      categoryId
      createdAt
      groupId
      id
      category {
        id
        label
        iconUrl
      }
      splits {
        userId
        userProfile {
          userId
          fullName
          avatarUrl
        }
        lentAmount
        borrowedAmount
      }
      label
      lentAmount
      borrowedAmount
      netBalance
      isLender
    }
    getTotalGroupExpenses(input: $input)
  }
`);

export const GET_GROUP_EXPENSE_QUERY = graphql(`
  query GetGroupExpense($input: GetGroupExpenseInput!) {
    getGroupExpense(input: $input) {
      amount
      categoryId
      createdAt
      groupId
      id
      label
      splits {
        id
        userId
        userProfile {
          fullName
          avatarUrl
          userId
        }
      }
      category {
        iconUrl
        id
        label
      }
    }
  }
`);

export const GET_EXPENSES_BY_CATEGORY_QUERY = graphql(`
  query GetExpensesByCategory {
    getExpensesByCategory {
      amount
      categoryId
      label
    }
  }
`);
