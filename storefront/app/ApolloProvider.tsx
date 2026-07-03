'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import apolloClient from '@/lib/apolloClient';

interface ApolloWrapperProps {
  children: React.ReactNode;
}

export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}

export default ApolloWrapper;
