import ts, { factory } from "typescript";
import { DocumentNode, Kind } from "graphql";
import { ASTReducer, visit } from "./typedVisitor";
import {
  ScalarType,
  TsCodegenContext,
  Type,
  EnumType,
  InterfaceType,
  ObjectType,
  UnionType,
} from "./context";
import {
  createNonNullableType,
  addModelSuffix,
  createTypeFromNode,
} from "./utilities";

export function generateModels(
  context: TsCodegenContext,
  document: DocumentNode,
): ts.SourceFile {
  const statements = context
    .getAllTypes()
    .map((type) => createModelForType(context, type))
    .filter((t) => t != null) as ts.Statement[];
  const imports = context.getAllModelImportDeclarations() as ts.Statement[];

  return factory.createSourceFile(
    imports.concat(context.getDefaultTypes(), statements),
    factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );
}

function createModelForType(
  context: TsCodegenContext,
  type: Type,
): ts.Statement | null {
  switch (type.kind) {
    case "OBJECT": {
      return createObjectTypeModel(context, type);
    }
    case "ENUM": {
      return createEnumTypeModel(context, type);
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
    if (context.importedEntity.has(name)) {
      context.addEntityToImport(name);
    }
    return factory.createIdentifier(addModelSuffix(name));
  });
  const extendTypes = [context.getBaseModelType()];
  if (model) {
    extendTypes.push(model);
  }

  const fields = type.fields.map(({ name, type }) =>
    factory.createPropertySignature(
      [factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
      factory.createIdentifier(name),
      undefined,
      createTypeFromNode(context, type),
    ),
  );

  return factory.createInterfaceDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(addModelSuffix(type.name)),
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

function createEnumTypeModel(
  context: TsCodegenContext,
  type: EnumType,
): ts.EnumDeclaration | null {
  return factory.createEnumDeclaration(
    undefined,
    [
      factory.createModifier(ts.SyntaxKind.ExportKeyword),
      factory.createModifier(ts.SyntaxKind.ConstKeyword),
    ],
    addModelSuffix(type.name),
    type.values.map((name) =>
      factory.createEnumMember(name, factory.createStringLiteral(name)),
    ),
  );
}

function createUnionTypeModel(
  context: TsCodegenContext,
  type: UnionType,
): ts.TypeAliasDeclaration | null {
  return factory.createTypeAliasDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(addModelSuffix(type.name)),
    undefined,
    factory.createUnionTypeNode(
      type.types?.map((type) => {
        return createNonNullableType(
          context.getModelType(type).toTypeReference(),
        );
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
    if (context.importedEntity.has(name)) {
      context.addEntityToImport(name);
    }
    return factory.createIdentifier(addModelSuffix(name));
  });

  return factory.createInterfaceDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(addModelSuffix(type.name)),
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
  return context.getScalarDeclaration(type.name) || null;
}