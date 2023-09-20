import { EntityReadFunction, RelayApolloCache, TypePolicies } from "../Cache";
import { FieldReadFunction, InMemoryCache } from "@apollo/client";

import {
  CacheTestQuery as CacheTestQueryType,
  CacheTestQueryDocument as QueryDocument,
  CacheTestFragment as FragmentDocument,
  CacheTestMessageQueryDocument as MessageQueryDocument,
  CacheTestMessageFragment as MessageFragmentDocument,
} from "../__generated__/operations";
import RelayModernStore from "relay-runtime/lib/store/RelayModernStore";
import RelayRecordSource from "relay-runtime/lib/store/RelayRecordSource";

import fs from "fs";
import path from "path";
import { parse, print as printGraphQL } from "graphql";

const schema = parse(
  fs.readFileSync(
    path.resolve(__dirname, "__fixtures__/schema.graphql"),
    "utf8",
  ),
);

const RESPONSE: CacheTestQueryType = {
  conversation: {
    __typename: "Conversation" as const,
    id: "42",
    title: "Hello World",
    messages: {
      edges: [],
    },
  },
};

function apollo(typePolicies?: TypePolicies, addTypename = false) {
  return new InMemoryCache({ typePolicies, addTypename });
}

function relayWithBuildtimeGeneratedIR(typePolicies?: TypePolicies) {
  return new RelayApolloCache({ typePolicies });
}

function relayWithRuntimeGeneratedIR(typePolicies?: TypePolicies) {
  return new RelayApolloCache({ typePolicies, schema });
}

const TEST_VARIANTS = [
  { client: apollo },
  { client: relayWithBuildtimeGeneratedIR },
  { client: relayWithRuntimeGeneratedIR },
];

describe("transformDocument", () => {
  it.each([{ client: apollo }, { client: relayWithRuntimeGeneratedIR }])(
    "adds __typename to documents with $client.name",
    ({ client }) => {
      const cache = client(undefined, true);
      const transformed = cache.transformDocument(QueryDocument);
      expect(printGraphQL(transformed)).toMatchSnapshot();
    },
  );

  it("does not add __typename at runtime when build-time IR is present", () => {
    const cache = relayWithBuildtimeGeneratedIR();
    const transformed = cache.transformDocument(QueryDocument);
    expect(printGraphQL(transformed)).not.toMatch("__typename");
  });
});

describe("writeQuery/readQuery", () => {
  it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
    const cache = client();
    cache.writeQuery({
      query: QueryDocument,
      data: RESPONSE,
      variables: { conversationId: "42" },
    });
    expect(
      cache.readQuery({
        query: QueryDocument,
        variables: { conversationId: "42" },
      }),
    ).toMatchSnapshot();
  });

  describe("concerning missing data", () => {
    beforeAll(() => {
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
      const cache = client();
      cache.writeQuery({
        query: QueryDocument,
        data: {
          conversation: {
            ...RESPONSE.conversation,
            title: undefined as any,
          },
        },
        variables: { conversationId: "42" },
      });
      expect(
        cache.readQuery({
          query: QueryDocument,
          variables: { conversationId: "42" },
        }),
      ).toBeNull();
      expect(
        cache.readQuery({
          query: QueryDocument,
          variables: { conversationId: "42" },
          returnPartialData: true,
        }),
      ).toMatchObject({
        conversation: {
          id: "42",
        },
      });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("title"),
      );
    });
  });

  describe("concerning optimistic updates", () => {
    it.each(TEST_VARIANTS)("applies update with $client.name", ({ client }) => {
      const cache = client();
      cache.recordOptimisticTransaction((c) => {
        c.writeQuery({
          query: QueryDocument,
          data: RESPONSE,
          variables: { conversationId: "42" },
        });
      }, "some-id");
      expect(
        cache.readQuery({
          query: QueryDocument,
          variables: { conversationId: "42" },
          // optimistic: false, // This is the default
        }),
      ).toBeNull();
      expect(
        cache.readQuery({
          query: QueryDocument,
          variables: { conversationId: "42" },
          optimistic: true,
        }),
      ).toMatchSnapshot();
    });

    it.each(TEST_VARIANTS)("applies update with $client.name", ({ client }) => {
      const cache = client();
      cache.writeQuery({
        query: QueryDocument,
        data: RESPONSE,
        variables: { conversationId: "42" },
      });
      cache.recordOptimisticTransaction((c) => {
        c.writeQuery({
          query: QueryDocument,
          data: {
            conversation: {
              ...RESPONSE.conversation,
              title: "Hello Optimistic World",
            },
          },
          variables: { conversationId: "42" },
        });
      }, "some-transaction-id");
      cache.removeOptimistic("some-transaction-id");
      expect(
        cache.readQuery({
          query: QueryDocument,
          variables: { conversationId: "42" },
          optimistic: true,
        }),
      ).toMatchSnapshot();
    });
  });
});

describe("writeFragment/readFragment", () => {
  it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
    const cache = client();
    cache.writeFragment({
      fragment: FragmentDocument,
      id: "Conversation:42",
      data: RESPONSE.conversation,
    });
    expect(
      cache.readFragment({
        id: "Conversation:42",
        fragment: FragmentDocument,
      }),
    ).toMatchSnapshot();
  });

  it.each(TEST_VARIANTS)(
    "works with $client.name and optimistic data",
    ({ client }) => {
      const cache = client();
      cache.recordOptimisticTransaction((c) => {
        c.writeFragment({
          fragment: FragmentDocument,
          id: "Conversation:42",
          data: RESPONSE.conversation,
        });
      }, "some-id");
      expect(
        cache.readFragment({
          id: "Conversation:42",
          fragment: FragmentDocument,
        }),
      ).toBeNull();
      expect(
        cache.readFragment({
          id: "Conversation:42",
          fragment: FragmentDocument,
          optimistic: true,
        }),
      ).toMatchSnapshot();
    },
  );

  it.each(TEST_VARIANTS)(
    "works with writeQuery for $client.name",
    ({ client }) => {
      const cache = client();
      cache.writeQuery({
        query: QueryDocument,
        data: RESPONSE,
        variables: { conversationId: "42" },
      });
      expect(
        cache.readFragment({
          id: "Conversation:42",
          fragment: FragmentDocument,
        }),
      ).toMatchSnapshot();
    },
  );

  describe("concerning missing data", () => {
    beforeAll(() => {
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
      const cache = client();
      cache.writeFragment({
        fragment: FragmentDocument,
        id: "Conversation:42",
        data: { ...RESPONSE.conversation, title: undefined as any },
      });
      expect(
        cache.readFragment({
          id: "Conversation:42",
          fragment: FragmentDocument,
        }),
      ).toBeNull();
      expect(
        cache.readFragment({
          id: "Conversation:42",
          fragment: FragmentDocument,
          returnPartialData: true,
        }),
      ).toMatchObject({
        id: expect.stringMatching(/42/),
      });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("title"),
      );
    });
  });
});

describe("watch", () => {
  it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
    expect.assertions(4);
    const cache = client();
    let count = 0;
    let disposeWatcher: () => void;
    const promise = new Promise<void>((resolve) => {
      disposeWatcher = cache.watch({
        query: QueryDocument,
        variables: { conversationId: "42" },
        optimistic: false,
        callback: (diff, lastDiff) => {
          switch (++count) {
            case 1: {
              expect(diff.result).toMatchSnapshot();
              expect(lastDiff).toBeUndefined();
              break;
            }
            case 2: {
              expect(diff.result).toMatchSnapshot();
              expect(lastDiff!.result).toMatchSnapshot();
              resolve();
            }
          }
        },
      });
    });
    setImmediate(() => {
      cache.writeQuery({
        query: QueryDocument,
        data: {
          conversation: {
            ...RESPONSE.conversation,
            title: "Hello World 1",
          },
        },
        variables: { conversationId: "42" },
      });
      setImmediate(() => {
        cache.writeQuery({
          query: QueryDocument,
          data: {
            conversation: {
              ...RESPONSE.conversation,
              title: "Hello World 2",
            },
          },
          variables: { conversationId: "42" },
        });
      });
    });
    return promise.finally(disposeWatcher!);
  });
});

describe("batch", () => {
  it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
    expect.assertions(1);
    const cache = client();
    let count = 0;
    const disposeWatcher = cache.watch({
      query: QueryDocument,
      variables: { conversationId: "42" },
      optimistic: false,
      callback: (_diff, _lastDiff) => {
        count++;
      },
    });
    cache.batch({
      update: (c) => {
        c.writeQuery({
          query: QueryDocument,
          data: {
            conversation: {
              ...RESPONSE.conversation,
              title: "Hello World 1",
            },
          },
          variables: { conversationId: "42" },
        });
        c.writeQuery({
          query: QueryDocument,
          data: {
            conversation: {
              ...RESPONSE.conversation,
              title: "Hello World 2",
            },
          },
          variables: { conversationId: "42" },
        });
      },
    });
    return new Promise<void>((resolve) => setImmediate(resolve))
      .then(() => expect(count).toEqual(1))
      .finally(disposeWatcher);
  });
});

describe("diff", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
    const cache = client();
    cache.writeQuery({
      query: QueryDocument,
      data: {
        conversation: {
          ...RESPONSE.conversation,
          title: undefined as any,
        },
      },
      variables: { conversationId: "42" },
    });
    expect(
      cache.diff({
        query: QueryDocument,
        variables: { conversationId: "42" },
        optimistic: false,
      }),
    ).toMatchObject({
      complete: false,
    });

    cache.writeQuery({
      query: QueryDocument,
      data: RESPONSE,
      variables: { conversationId: "42" },
    });
    expect(
      cache.diff<unknown>({
        query: QueryDocument,
        variables: { conversationId: "42" },
        optimistic: false,
      }),
    ).toMatchObject({
      complete: true,
    });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("title"),
    );
  });
});

describe("extract/restore", () => {
  it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
    const cache = client();
    cache.writeQuery({
      query: QueryDocument,
      data: RESPONSE,
      variables: { conversationId: "42" },
    });
    const data = cache.extract();
    const newCache = client();
    newCache.restore(data as any);
    expect(newCache.extract()).toEqual(cache.extract());
  });
});

function defaultReadFunction(entityFn: EntityReadFunction): FieldReadFunction {
  return function readFunction(existing, { args, toReference, canRead }) {
    if (canRead(existing)) {
      return existing;
    }

    const entity = entityFn(args);

    if (canRead(entity)) {
      return toReference(entity);
    }
  };
}
describe("Type Policies", () => {
  describe("key-fields", () => {
    describe("concerning identification", () => {
      it.each(TEST_VARIANTS)(
        "by default uses typename+id with $client.name",
        ({ client }) => {
          const cache = client();
          expect(cache.identify({ id: "42" })).toBeUndefined();
          expect(
            cache.identify({ __typename: "Conversation" }),
          ).toBeUndefined();
          expect(
            cache.identify({ __typename: "Conversation", id: "42" }),
          ).toEqual("Conversation:42");
        },
      );

      it.todo(
        "uses only the id if the type implements the Node interface with relay",
      );
    });

    describe("concerning normalization", () => {
      describe.each([
        {
          scenario: "with default key-fields",
          typePolicies: {
            Conversation: {
              keyFields: undefined,
            },
            Message: {
              keyFields: undefined,
            },
          } as TypePolicies,
        },
        {
          scenario: "without key-fields",
          typePolicies: {
            Conversation: {
              keyFields: false,
            },
            Message: {
              keyFields: false,
            },
          } as TypePolicies,
        },
        {
          scenario: "with custom key-fields",
          typePolicies: {
            Conversation: {
              keyFields: ["id", "title"],
            },
            Message: {
              keyFields: ["authorId", "createdAt", "id"],
            },
          } as TypePolicies,
        },
      ])("$scenario", ({ typePolicies }) => {
        it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
          const cache = client(typePolicies);
          const response: CacheTestQueryType = {
            conversation: {
              ...RESPONSE.conversation,
              messages: {
                edges: [
                  {
                    node: {
                      __typename: "Message",
                      id: "message-42",
                      authorId: "author-42",
                      text: "Hello World",
                      createdAt: "2020-01-01T00:00:00.000Z",
                    },
                  },
                ],
              },
            },
          };
          cache.writeQuery({
            query: QueryDocument,
            data: response as any,
            variables: { conversationId: "42", includeNestedData: true },
          });
          expect(
            cache.readQuery({
              query: QueryDocument,
              variables: { conversationId: "42", includeNestedData: true },
            }),
          ).toMatchSnapshot();
          expect(cache.extract()).toMatchSnapshot();
        });
      });
    });
  });

  describe("read functions / missing field handlers", () => {
    const messageReadFunction: EntityReadFunction = (args) => {
      return {
        __typename: "Message",
        id: args?.messageId,
      };
    };

    const typePolicies = {
      Query: {
        fields: {
          message: {
            read: defaultReadFunction(messageReadFunction),
            readFunction: messageReadFunction,
          },
        },
      },
    };
    it.each(TEST_VARIANTS)("works with $client.name", ({ client }) => {
      const cache = client(typePolicies);
      const response: CacheTestQueryType = {
        conversation: {
          ...RESPONSE.conversation,
          messages: {
            edges: [
              {
                node: {
                  __typename: "Message",
                  id: "message-42",
                  authorId: "author-42",
                  text: "Hello World",
                  createdAt: "2020-01-01T00:00:00.000Z",
                },
              },
            ],
          },
        },
      };
      cache.writeQuery({
        query: QueryDocument,
        data: response,
        variables: { conversationId: "42", includeNestedData: true },
      });
      expect(
        cache.readFragment({
          fragment: MessageFragmentDocument,
          id: "Message:message-42",
        }),
      ).toMatchSnapshot();
      expect(
        cache.readQuery({
          query: MessageQueryDocument,
          variables: {
            id: "message-42",
          },
        }),
      ).toMatchSnapshot();
    });
  });
});
describe("read memoization", () => {
  it("does not actually hit the store again for the same query/variables", () => {
    const store = new RelayModernStore(new RelayRecordSource());
    const cache = new RelayApolloCache({ store });
    cache.writeQuery({
      query: QueryDocument,
      data: RESPONSE,
      variables: { conversationId: "42" },
    });
    const read = () => {
      return cache.readQuery({
        query: QueryDocument,
        variables: { conversationId: "42" },
      });
    };
    const spy = jest.spyOn(store, "lookup");
    const response1 = read();
    const response2 = read();
    expect(response1).toBe(response2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it.todo(
    "removes the entry from the memoization cache when the store evicts the snapshot",
  );

  it("disposes the store subscription when the memoization cache evicts the entry", () => {
    const store = new RelayModernStore(new RelayRecordSource());
    const cache = new RelayApolloCache({ store, resultCacheMaxSize: 1 });
    const subscribe = jest.spyOn(store, "subscribe");

    cache.writeQuery({
      query: QueryDocument,
      data: RESPONSE,
      variables: { conversationId: "42" },
    });
    cache.readQuery({
      query: QueryDocument,
      variables: { conversationId: "42" },
    });

    const disposable = subscribe.mock.results[0].value;
    const dispose = jest.spyOn(disposable, "dispose");

    cache.writeQuery({
      query: QueryDocument,
      data: RESPONSE,
      variables: { conversationId: "43" },
    });
    cache.readQuery({
      query: QueryDocument,
      variables: { conversationId: "43" },
    });

    expect(dispose).toHaveBeenCalled();
  });
});
