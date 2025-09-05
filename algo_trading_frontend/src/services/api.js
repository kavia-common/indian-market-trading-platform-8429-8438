import React, { createContext, useContext, useMemo } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider, gql } from '@apollo/client';
import { handleApiError, ApiError } from '../utils/errorHandler';

const ApiContext = createContext(null);

/**
 * Lightweight REST client with base URL and helpers.
 */
function createRestClient(baseUrl) {
  const headers = { 'Content-Type': 'application/json' };

  // PUBLIC_INTERFACE
  async function get(path) {
    /** GET request to backend REST API. Returns JSON. */
    try {
      const res = await fetch(`${baseUrl}${path}`, { headers });
      if (!res.ok) {
        throw new ApiError(`GET ${path} failed`, res.status, await res.json().catch(() => null));
      }
      return res.json();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // PUBLIC_INTERFACE
  async function post(path, body) {
    /** POST request to backend REST API. Returns JSON. */
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body ?? {}),
      });
      if (!res.ok) {
        throw new ApiError(`POST ${path} failed`, res.status, await res.json().catch(() => null));
      }
      return res.json();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // PUBLIC_INTERFACE
  async function del(path) {
    /** DELETE request to backend REST API. Returns JSON. */
    try {
      const res = await fetch(`${baseUrl}${path}`, { method: 'DELETE', headers });
      if (!res.ok) {
        throw new ApiError(`DELETE ${path} failed`, res.status, await res.json().catch(() => null));
      }
      return res.json();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  return { get, post, del };
}

/**
 * Apollo GraphQL client factory with error handling
 */
function createGraphQLClient(baseUrl) {
  const link = new HttpLink({ 
    uri: `${baseUrl}/graphql`,
    fetch: async (uri, options) => {
      try {
        const response = await fetch(uri, options);
        if (!response.ok) {
          throw new ApiError('GraphQL request failed', response.status);
        }
        return response;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  });
  const cache = new InMemoryCache();
  return new ApolloClient({ link, cache });
}

// PUBLIC_INTERFACE
export function ApiProvider({ baseUrl, children }) {
  /** Provides REST and GraphQL clients to component tree. */
  const rest = useMemo(() => createRestClient(baseUrl), [baseUrl]);
  const gqlClient = useMemo(() => createGraphQLClient(baseUrl), [baseUrl]);

  const api = useMemo(() => ({
    rest,
    gql: {
      client: gqlClient,
      // PUBLIC_INTERFACE
      async ping() {
        /** Example GraphQL ping to validate connectivity. */
        try {
          const query = gql`query Ping { ping }`;
          const { data } = await gqlClient.query({ query });
          return data?.ping;
        } catch (error) {
          throw handleApiError(error);
        }
      },
    },
    // PUBLIC_INTERFACE
    async mockLatency(ms = 400) {
      /** Utility to simulate latency in the UI during mock mode. */
      await new Promise(r => setTimeout(r, ms));
    }
  }), [rest, gqlClient]);

  return (
    <ApiContext.Provider value={api}>
      <ApolloProvider client={gqlClient}>{children}</ApolloProvider>
    </ApiContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useApi() {
  /** Hook to access REST/GraphQL clients. */
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}
