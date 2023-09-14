import React, { useCallback } from "react";
import {
  useFragment,
  shallowCompareFragmentReferences,
  usePaginationFragment,
} from "@graphitation/apollo-react-relay-duct-tape";
import { graphql } from "@graphitation/graphql-js-tag";

import { TodoList_nodeFragment$key } from "./__generated__/TodoList_nodeFragment.graphql";
import { Todo } from "./Todo";
import { LoadingSpinner } from "./LoadingSpinner";

const TodoList: React.FC<{ node: TodoList_nodeFragment$key }> = ({
  node: nodeRef,
}) => {
  const {
    data: node,
    hasNext,
    loadNext,
    isLoadingNext,
  } = usePaginationFragment(
    graphql`
      fragment TodoList_nodeFragment on NodeWithTodos
      @refetchable(queryName: "TodoListPaginationQuery")
      @argumentDefinitions(
        count: { type: "Int!", defaultValue: 5 }
        after: { type: "String!", defaultValue: "" }
      ) {
        __typename
        todos(first: $count, after: $after)
          @connection(key: "TodosList_todos") {
          edges {
            node {
              id
              isCompleted
              ...Todo_todoFragment
            }
          }
        }
      }
    `,
    nodeRef,
  );
  console.log("TodoList watch data:", node);

  /* <!-- List items should get the class `editing` when editing and `completed` when marked as completed --> */
  return (
    <ul className="todo-list">
      {node.todos.edges.map(({ node: todo }) => {
        return (
          <li key={todo.id} className={todo.isCompleted ? "completed" : ""}>
            <Todo todo={todo} />
          </li>
        );
      })}
      {hasNext || isLoadingNext ? (
        <li className="load-more">
          {isLoadingNext ? (
            <LoadingSpinner />
          ) : (
            <input
              type="submit"
              value="Load more..."
              onClick={() => loadNext(5)}
            />
          )}
        </li>
      ) : null}
    </ul>
  );
};

(TodoList as any).whyDidYouRender = true;

const MemoizedTodoList = React.memo(
  TodoList,
  shallowCompareFragmentReferences("node"),
);
export { MemoizedTodoList as TodoList };
