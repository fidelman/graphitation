/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
;
import { FragmentRefs } from "@graphitation/apollo-react-relay-duct-tape";
export type compiledHooks_Root_executionQueryVariables = {
    userId: string;
};
export type compiledHooks_Root_executionQueryResponse = {
    readonly user: {
        readonly name: string;
        readonly " $fragmentRefs": FragmentRefs<"compiledHooks_ChildFragment" | "compiledHooks_RefetchableFragment">;
    };
};
export type compiledHooks_Root_executionQuery = {
    readonly response: compiledHooks_Root_executionQueryResponse;
    readonly variables: compiledHooks_Root_executionQueryVariables;
};

/*
query compiledHooks_Root_executionQuery($userId: ID!) {
  user(id: $userId) {
    name
    ...compiledHooks_ChildFragment
    ...compiledHooks_RefetchableFragment
    id
  }
}

fragment compiledHooks_ChildFragment on User {
  petName
  id
}

fragment compiledHooks_RefetchableFragment on User {
  petName
  id
}

*/
export const executionQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"compiledHooks_Root_executionQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},"directives":[]}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"},"arguments":[],"directives":[]},{"kind":"FragmentSpread","name":{"kind":"Name","value":"compiledHooks_ChildFragment"},"directives":[]},{"kind":"FragmentSpread","name":{"kind":"Name","value":"compiledHooks_RefetchableFragment"},"directives":[]},{"kind":"Field","name":{"kind":"Name","value":"id"},"arguments":[],"directives":[]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"compiledHooks_ChildFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"petName"},"arguments":[],"directives":[]},{"kind":"Field","name":{"kind":"Name","value":"id"},"arguments":[],"directives":[]}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"compiledHooks_RefetchableFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"petName"},"arguments":[],"directives":[]},{"kind":"Field","name":{"kind":"Name","value":"id"},"arguments":[],"directives":[]}]}}]};

/*
query compiledHooks_Root_executionQuery($userId: ID!) {
  user(id: $userId) {
    name
    id
  }
}

*/
export const watchQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"compiledHooks_Root_executionQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},"directives":[]}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"},"arguments":[],"directives":[]},{"kind":"Field","name":{"kind":"Name","value":"id"},"arguments":[],"directives":[]}]}}]}}]};