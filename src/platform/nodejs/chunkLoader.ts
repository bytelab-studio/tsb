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
            [factory.createExpressionStatement(factory.createCallExpression(
                factory.createIdentifier("require"),
                undefined,
                [factory.createBinaryExpression(
                    factory.createBinaryExpression(
                        factory.createIdentifier("__dirname"),
                        factory.createToken(ts.SyntaxKind.PlusToken),
                        factory.createStringLiteral("/")
                    ),
                    factory.createToken(ts.SyntaxKind.PlusToken),
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("chunk"),
                        factory.createIdentifier("filePath")
                    )
                )]
            ))],
            true
        )
    );
}