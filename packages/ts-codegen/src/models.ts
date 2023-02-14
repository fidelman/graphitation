import ts, { factory } from "typescript";
import { DocumentNode } from "graphql";
import {
  ScalarType,
  TsCodegenContext,
  Type,
  EnumType,
  InterfaceType,
  ObjectType,
  UnionType,
} from "./context";
import { addModelSuffix } from "./utilities";

export function generateModels(
  context: TsCodegenContext,
  document: DocumentNode,
): ts.SourceFile {
  const enumsImport = context.getEnumsImport();

  const statements = context
    .getAllTypes()
    .map((type) => createModelForType(context, type))
    .filter((t) => t != null) as ts.Statement[];

  const imports = context.getAllModelImportDeclarations() as ts.Statement[];

  const enumsStatements: ts.Statement[] = [];
  enumsStatements.push(
    ...context
      .getAllTypes()
      .map((type) => {
        const enumsSource = enumsImport ? enumsImport : "./enums.interface";
        const output: ts.Statement[] = [];
        if (type.kind === "ENUM") {
          if (context.isUsedEntityInModels(type.name)) {
            output.push(
              factory.createImportDeclaration(
                undefined,
                undefined,
                factory.createImportClause(
                  false,
                  undefined,
                  factory.createNamedImports([
                    factory.createImportSpecifier(
                      undefined,
                      factory.createIdentifier(type.name),
                    ),
                  ]),
                ),
                factory.createStringLiteral(enumsSource),
              ),
            );
          }

          output.push(
            factory.createExportDeclaration(
              undefined,
              undefined,
              false,
              factory.createNamedExports([
                factory.createExportSpecifier(
                  undefined,
                  factory.createIdentifier(type.name),
                ),
              ]),
              factory.createStringLiteral(enumsSource),
            ),
          );
        }
        return output;
      })
      .filter(Boolean)
      .flat(),
  );

  const source = factory.createSourceFile(
    imports.concat(context.getDefaultTypes(), enumsStatements, statements),
    factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  source.fileName = "models.interface.ts";
  return source;
}

function createModelForType(
  context: TsCodegenContext,
  type: Type,
): ts.Statement | null {
  switch (type.kind) {
    case "OBJECT": {
      return createObjectTypeModel(context, type);
    }
    case "UNION": {
      return createUnionTypeModel(context, type);
    }
    case "INTERFACE": {
      return createInterfaceTypeModel(context, type);
    }
    case "SCALAR": {
      return createScalarModel(context, type);
    }
    default: {
      return null;
    }
  }
}

function createObjectTypeModel(
  context: TsCodegenContext,
  type: ObjectType,
): ts.InterfaceDeclaration | null {
  if (["Query", "Mutation", "Subscription"].includes(type.name)) {
    return null;
  }

  const model = context.getDefinedModelType(type.name);
  const interfaces = type.interfaces.map((name) => {
    return context.getModelType(name, "MODELS").toExpression();
  });
  const extendTypes = [context.getBaseModelType()];
  if (model) {
    extendTypes.push(model);
  }

  const fields = type.fields.map(({ name, type: fieldType }) =>
    factory.createPropertySignature(
      [factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
      factory.createIdentifier(name),
      fieldType.kind !== "NonNullType"
        ? factory.createToken(ts.SyntaxKind.QuestionToken)
        : undefined,
      context.getTypeReferenceFromTypeNode(
        fieldType,
        type.model ? undefined : "MODELS",
      ),
    ),
  );

  return factory.createInterfaceDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(type.name),
    undefined,
    [
      factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ...extendTypes.map((type) =>
          factory.createExpressionWithTypeArguments(
            type.toExpression(),
            undefined,
          ),
        ),
        ...interfaces.map((interfaceExpression) =>
          factory.createExpressionWithTypeArguments(
            interfaceExpression,
            undefined,
          ),
        ),
      ]),
    ],
    [
      factory.createPropertySignature(
        [factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
        "__typename",
        factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createLiteralTypeNode(factory.createStringLiteral(type.name)),
      ),
      ...((!model && fields) || []),
    ],
  );
}

function createUnionTypeModel(
  context: TsCodegenContext,
  type: UnionType,
): ts.TypeAliasDeclaration | null {
  return factory.createTypeAliasDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(type.name),
    undefined,
    factory.createUnionTypeNode(
      type.types?.map((type) => {
        return context.getModelType(type, "MODELS").toTypeReference();
      }) || [],
    ),
  );
}

function createInterfaceTypeModel(
  context: TsCodegenContext,
  type: InterfaceType,
): ts.InterfaceDeclaration | null {
  const extendTypes = [context.getBaseModelType()];
  const interfaces = type.interfaces.map((name) => {
    return context.getModelType(name, "MODELS").toExpression();
  });

  return factory.createInterfaceDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(type.name),
    undefined,
    [
      factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ...extendTypes.map((type) =>
          factory.createExpressionWithTypeArguments(
            type.toExpression(),
            undefined,
          ),
        ),
        ...interfaces.map((interfaceExpression) =>
          factory.createExpressionWithTypeArguments(
            interfaceExpression,
            undefined,
          ),
        ),
      ]),
    ],
    [
      factory.createPropertySignature(
        [factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
        "__typename",
        factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
      ),
    ],
  );
}

function createScalarModel(
  context: TsCodegenContext,
  type: ScalarType,
): ts.TypeAliasDeclaration | null {
  return context.getScalarDefinition(type.name) || null;
}
