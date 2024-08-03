import * as ts from "typescript";

export function generateModuleHeader(moduleName: string): ts.Statement[] {
    const factory: typeof ts.factory = ts.factory;

    return [
        factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                    factory.createObjectBindingPattern([factory.createBindingElement(
                        undefined,
                        undefined,
                        factory.createIdentifier("TSBModule"),
                        undefined
                    )]),
                    undefined,
                    undefined,
                    factory.createCallExpression(
                        factory.createIdentifier("require"),
                        undefined,
                        [factory.createStringLiteral("../" + moduleName)]
                    )
                )],
                ts.NodeFlags.Const
            )
        )
    ];
}