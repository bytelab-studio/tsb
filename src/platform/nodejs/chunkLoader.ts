import * as ts from "typescript";

export function generateChunkLoader(): ts.MethodDeclaration {
    const factory: typeof ts.factory = ts.factory;
    return factory.createMethodDeclaration(
        [
            factory.createToken(ts.SyntaxKind.PublicKeyword),
            factory.createToken(ts.SyntaxKind.AsyncKeyword)
        ],
        undefined,
        factory.createIdentifier("loadChunk"),
        undefined,
        undefined,
        [factory.createParameterDeclaration(
            undefined,
            undefined,
            factory.createIdentifier("chunk"),
            undefined,
            factory.createTypeReferenceNode(
                factory.createIdentifier("ChunkInfo"),
                undefined
            ),
            undefined
        )],
        factory.createTypeReferenceNode(
            factory.createIdentifier("Promise"),
            [factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)]
        ),
        factory.createBlock(
            [
                factory.createExpressionStatement(
                    factory.createCallExpression(
                        factory.createIdentifier("require"),
                        undefined,
                        [factory.createBinaryExpression(
                            factory.createElementAccessExpression(
                                factory.createIdentifier("chunk"),
                                factory.createNumericLiteral("0")
                            ),
                            factory.createToken(ts.SyntaxKind.PlusToken),
                            factory.createElementAccessExpression(
                                factory.createIdentifier("chunk"),
                                factory.createNumericLiteral("1")
                            )
                        )]
                    )
                )
            ],
            true
        )
    );
}