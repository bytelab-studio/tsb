import * as ts from "typescript";

export function generateModuleConstructor(hash: string): ts.VariableStatement {
    const factory: typeof ts.factory = ts.factory;

    return factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
                factory.createIdentifier("module"),
                undefined,
                factory.createTypeReferenceNode(
                    factory.createIdentifier("TSBModule"),
                    undefined
                ),
                factory.createNewExpression(
                    factory.createIdentifier("TSBModule"),
                    undefined,
                    [factory.createStringLiteral(hash)]
                )
            )],
            ts.NodeFlags.Const
        )
    );
}