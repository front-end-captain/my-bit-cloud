import React, { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import type { GraphQLClient } from "../graphql.ui.runtime";

export type GraphQLProviderProps = {
  client: GraphQLClient<any>;
  children: ReactNode;
};

export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({ client, children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
