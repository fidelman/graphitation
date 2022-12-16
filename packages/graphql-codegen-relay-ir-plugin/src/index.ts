import {
  Types,
  PluginValidateFn,
  PluginFunction,
} from "@graphql-codegen/plugin-helpers";
import {
  GraphQLSchema,
  Source,
  printSchema,
  DocumentNode,
  visit,
  Kind,
  parse,
  OperationDefinitionNode,
} from "graphql";
import { extname } from "path";
import {
  RawClientSideBasePluginConfig,
  DocumentMode,
} from "@graphql-codegen/visitor-plugin-common";
import CompilerContext, {
  IRTransform,
} from "relay-compiler/lib/core/CompilerContext";
import { create as createRelaySchema } from "relay-compiler/lib/core/Schema";
import { parse as parseRelay } from "relay-compiler/lib/core/RelayParser";
import { generate as generateRelay } from "relay-compiler/lib/codegen/RelayCodeGenerator";
import {
  codegenTransforms,
  fragmentTransforms,
} from "relay-compiler/lib/core/RelayIRTransforms";
import dedupeJSONStringify from "relay-compiler/lib/util/dedupeJSONStringify";
import { Request } from "relay-compiler/lib/core/IR";
// import { addTypesToRequestDocument } from "@graphitation/supermassive/lib/index.js";
import { print } from "relay-compiler/lib/core/IRPrinter";
// import type { DocumentNode as SupermassiveDocumentNode } from "@graphitation/supermassive";
// import { OperationDefinitionNode } from "@graphitation/supermassive/src/ast/TypedAST";
import inlineFragmentsTransform from "./InlineFragmentsWithoutRemovingFragmentsTransform";

const SchemaCache = new WeakMap();

export const plugin: PluginFunction<RawClientSideBasePluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawClientSideBasePluginConfig,
) => {
  if (!SchemaCache.has(schema)) {
    SchemaCache.set(schema, createRelaySchema(new Source(printSchema(schema))));
  }
  const relaySchema = SchemaCache.get(schema);
  let compilerContext = new CompilerContext(relaySchema);
  const documentsByName: { [key: string]: DocumentNode } = {};
  documents.forEach(({ document, rawSDL }) => {
    if (document && rawSDL) {
      const locationLessDocument: DocumentNode = visit(document, {
        leave(node) {
          if (node.loc) {
            return {
              ...node,
              loc: undefined,
            };
          } else {
            return node;
          }
        },
      });
      // const supermassiveDocument: DocumentNode = addTypesToRequestDocument(
      //   schema,
      //   visit(document, {
      //     leave(node) {
      //       if (node.loc) {
      //         return {
      //           ...node,
      //           loc: undefined,
      //         };
      //       } else {
      //         return node;
      //       }
      //     },
      //   }),
      // );
      const operation = locationLessDocument.definitions.find(
        ({ kind }) => kind === "OperationDefinition",
      ) as OperationDefinitionNode | undefined;
      if (operation && operation.name?.value) {
        documentsByName[operation.name.value] = locationLessDocument;
      }

      const parsed = parseRelay(relaySchema, rawSDL);
      for (const node of parsed) {
        compilerContext = compilerContext.add(node);
      }
    }
  });

  let queryCompilerContext = compilerContext.applyTransforms([
    ...(codegenTransforms as IRTransform[]),
  ]);
  let fragmentCompilerContext = compilerContext.applyTransforms([
    inlineFragmentsTransform,
    ...(fragmentTransforms as IRTransform[]),
  ]);
  const results: Array<{ name: string; node: string }> = [];
  queryCompilerContext.forEachDocument((node) => {
    if (node.kind === "Root") {
      const fragment = queryCompilerContext.getRoot(node.name);
      const name = fragment.name;
      const request: Request = {
        kind: "Request",
        fragment: {
          kind: "Fragment",
          name,
          argumentDefinitions: fragment.argumentDefinitions,
          directives: fragment.directives,
          loc: { kind: "Derived", source: node.loc },
          metadata: undefined,
          selections: fragment.selections as any,
          type: fragment.type,
        },
        id: undefined,
        loc: node.loc,
        metadata: node.metadata || {},
        name: fragment.name,
        root: node,
        text: "",
      };
      const document = documentsByName[name];
      if (!document) {
        throw new Error("Some weird document we can't find: " + name);
      }
      let generatedNode = generateRelay(relaySchema, request);
      results.push({
        name,
        node: dedupeJSONStringify({
          ...document,
          __relay: generatedNode,
        }),
      });
    }
  });

  fragmentCompilerContext.forEachDocument((node) => {
    if (node.kind === "Fragment") {
      const generatedNode = generateRelay(relaySchema, node);
      const name = generatedNode.name;
      const document = parse(print(relaySchema, node), {
        noLocation: true,
      });

      results.push({
        name,
        node: dedupeJSONStringify({
          ...document,
          __relay: generatedNode,
        }),
      });
    }
  });

  compilerContext = null as any;
  queryCompilerContext = null as any;
  fragmentCompilerContext = null as any;

  return {
    prepend: [`import { DocumentNode } from "graphql";`],
    content: results
      .map(
        ({ name, node }) =>
          `export const ${name}Document: DocumentNode = ${node};`,
      )
      .join(`\n`),
  };
};

export const validate: PluginValidateFn<RawClientSideBasePluginConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
  outputFile: string,
) => {
  if (config && config.documentMode === DocumentMode.string) {
    throw new Error(
      `Plugin "supermassive-typed-document-node" does not allow using 'documentMode: string' configuration!`,
    );
  }

  if (extname(outputFile) !== ".ts" && extname(outputFile) !== ".tsx") {
    throw new Error(
      `Plugin "supermassive-typed-document-node" requires extension to be ".ts" or ".tsx"!`,
    );
  }
};