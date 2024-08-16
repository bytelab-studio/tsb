import * as ts from "typescript";

export function generateFileMapLoader(): ts.MethodDeclaration {
    return ts.factory.createMethodDeclaration(
        [
            ts.factory.createToken(ts.SyntaxKind.PrivateKeyword),
            ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)
        ],
        undefined,
        ts.factory.createIdentifier("loadFileMap"),
        undefined,
        undefined,
        [ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            ts.factory.createIdentifier("p"),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            undefined
        )],
        ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier("Promise"),
            [ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)]
        ),
        ts.factory.createBlock(
            [
                ts.factory.createReturnStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createIdentifier("require"),
                        undefined,
                        [
                            ts.factory.createIdentifier("p")
                        ]
                    )
                )
            ],
            true
        )
    )
}