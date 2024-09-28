import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache
} from '@apollo/client';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support';
import { getCookie } from 'cookies-next';
import { cookies } from 'next/headers';
import { authCookieKey } from './constants';

export const { getClient } = registerApolloClient(() => {
  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        Authorization: `Bearer ${getCookie(authCookieKey, { cookies })}`
      }
    }));
    return forward(operation);
  });

  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
    fetchOptions: { cache: 'no-store' }
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([authLink, httpLink])
  });
});
