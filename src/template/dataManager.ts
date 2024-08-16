import * as ts from "typescript";
import {PlatformPlugin} from "../plugin";

/*


class DataManager {
    private chunks: ChunkInfo[] = [] // chunkMap

    private getChunkFromModule(module: string): ChunkInfo {
        const info: ChunkInfo | undefined = this.chunks.find(chunk => chunk.modules.includes(module));
        if (!info) {
            throw `Module '${module}' is not registered in a chunk`;
        }
        return info;
    }

    private getChunkFromHash(hash: string): ChunkInfo {
        const info: ChunkInfo | undefined = this.chunks.find(chunk => chunk.hash == hash);
        if (!info) {
            throw `Chunk with the hash '${hash}' is not registered`;
        }
        return info;
    }

    public async loadModule(module: string, AppDomain: AppDomain): Promise<Record<string, any>> {
        const info: ChunkInfo = this.getChunkFromModule(module);
        if (!info.loaded) {
            await this.loadChunk(info);
            info.loaded = true;
        }
        return info.holder!.loadModule(module, AppDomain);
    }

    // Declared through platform
    public async loadChunk(chunk: ChunkInfo): Promise<void> {};

    public registerModule(chunkHash: string, module: TSBModule): void {
        const info: ChunkInfo = this.getChunkFromHash(chunkHash) as ChunkInfo;
        info.holder = module;
    }
}

 */

export function generateDataManager(platform: PlatformPlugin, chunkMap?: ts.ArrayLiteralExpression): ts.ClassDeclaration {
    return ts.factory.createClassDeclaration(
        undefined,
        ts.factory.createIdentifier("DataManager"),
        undefined,
        undefined,
        [
            ...generateFields(chunkMap),
            ...generateGetChunkMethods(),
            ...generateLoadMethods(),

            platform.generateChunkLoader(),
            ts.factory.createMethodDeclaration(
                [ts.factory.createToken(ts.SyntaxKind.PublicKeyword)],
                undefined,
                ts.factory.createIdentifier("registerModule"),
                undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        ts.factory.createIdentifier("chunkHash"),
                        undefined,
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        undefined
                    ),
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        ts.factory.createIdentifier("module"),
                        undefined,
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier("TSBModule"),
                            undefined
                        ),
                        undefined
                    )
                ],
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                ts.factory.createBlock(
                    [
                        ts.factory.createVariableStatement(
                            undefined,
                            ts.factory.createVariableDeclarationList(
                                [ts.factory.createVariableDeclaration(
                                    ts.factory.createIdentifier("info"),
                                    undefined,
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                                    ts.factory.createAsExpression(
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createThis(),
                                                ts.factory.createIdentifier("getChunkFromHash")
                                            ),
                                            undefined,
                                            [ts.factory.createIdentifier("chunkHash")]
                                        ),
                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                    )
                                )]
                            )
                        ),
                        ts.factory.createExpressionStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createElementAccessExpression(
                                    ts.factory.createIdentifier("info"),
                                    ts.factory.createNumericLiteral("5")
                                ),
                                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                ts.factory.createIdentifier("module")
                            )
                        )
                    ],
                    true
                )
            )
        ]
    );
}

function generateFields(chunkMap: ts.ArrayLiteralExpression | undefined): ts.ClassElement[] {
    return [
        ts.factory.createPropertyDeclaration(
            [ts.factory.createToken(ts.SyntaxKind.PrivateKeyword)],
            "chunks",
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            chunkMap || ts.factory.createArrayLiteralExpression()
        )
    ];
}

function generateGetChunkMethods(): ts.ClassElement[] {
    return [
        ts.factory.createMethodDeclaration(
            [ts.factory.createToken(ts.SyntaxKind.PrivateKeyword)],
            undefined,
            "getChunkFromModule",
            undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "module",
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    undefined
                )
            ],
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            ts.factory.createBlock([
                ts.factory.createVariableStatement(
                    undefined,
                    [
                        ts.factory.createVariableDeclaration(
                            "info",
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createThis(),
                                        ts.factory.createIdentifier("chunks")
                                    ),
                                    ts.factory.createIdentifier("find")
                                ),
                                undefined,
                                [ts.factory.createArrowFunction(
                                    undefined,
                                    undefined,
                                    [ts.factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        ts.factory.createIdentifier("c"),
                                        undefined,
                                        undefined,
                                        undefined
                                    )],
                                    undefined,
                                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createElementAccessExpression(
                                                        ts.factory.createIdentifier("c"),
                                                        ts.factory.createNumericLiteral("4")
                                                    ),
                                                    ts.factory.createIdentifier("map")
                                                ),
                                                undefined,
                                                [ts.factory.createArrowFunction(
                                                    undefined,
                                                    undefined,
                                                    [ts.factory.createParameterDeclaration(
                                                        undefined,
                                                        undefined,
                                                        ts.factory.createIdentifier("l"),
                                                        undefined,
                                                        undefined,
                                                        undefined
                                                    )],
                                                    undefined,
                                                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                                    ts.factory.createElementAccessExpression(
                                                        ts.factory.createIdentifier("l"),
                                                        ts.factory.createNumericLiteral("0")
                                                    )
                                                )]
                                            ),
                                            ts.factory.createIdentifier("includes")
                                        ),
                                        undefined,
                                        [ts.factory.createIdentifier("module")]
                                    )
                                )]
                            )
                        )
                    ]
                ),
                ts.factory.createIfStatement(
                    ts.factory.createPrefixUnaryExpression(
                        ts.SyntaxKind.ExclamationToken,
                        ts.factory.createIdentifier("info")
                    ),
                    ts.factory.createBlock([
                        ts.factory.createThrowStatement(ts.factory.createTemplateExpression(
                            ts.factory.createTemplateHead(
                                "Module '",
                                "Module '"
                            ),
                            [
                                ts.factory.createTemplateSpan(
                                    ts.factory.createIdentifier("module"),
                                    ts.factory.createTemplateTail(
                                        "' is not registered in a chunk",
                                        "' is not registered in a chunk"
                                    )
                                )
                            ]
                        ))
                    ])
                ),
                ts.factory.createReturnStatement(
                    ts.factory.createIdentifier("info")
                )
            ])
        ),
        ts.factory.createMethodDeclaration(
            [ts.factory.createToken(ts.SyntaxKind.PrivateKeyword)],
            undefined,
            "getChunkFromHash",
            undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "hash",
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    undefined
                )
            ],
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            ts.factory.createBlock([
                ts.factory.createVariableStatement(
                    undefined,
                    [
                        ts.factory.createVariableDeclaration(
                            "info",
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createThis(),
                                        ts.factory.createIdentifier("chunks")
                                    ),
                                    ts.factory.createIdentifier("find")
                                ),
                                undefined,
                                [ts.factory.createArrowFunction(
                                    undefined,
                                    undefined,
                                    [ts.factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        ts.factory.createIdentifier("c"),
                                        undefined,
                                        undefined,
                                        undefined
                                    )],
                                    undefined,
                                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                    ts.factory.createBinaryExpression(
                                        ts.factory.createElementAccessExpression(
                                            ts.factory.createIdentifier("c"),
                                            ts.factory.createNumericLiteral("1")
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
                                        ts.factory.createIdentifier("hash")
                                    )
                                )]
                            )
                        )
                    ]
                ),
                ts.factory.createIfStatement(
                    ts.factory.createPrefixUnaryExpression(
                        ts.SyntaxKind.ExclamationToken,
                        ts.factory.createIdentifier("info")
                    ),
                    ts.factory.createBlock([
                        ts.factory.createThrowStatement(ts.factory.createTemplateExpression(
                            ts.factory.createTemplateHead(
                                "Chunk with the hash '",
                                "Chunk with the hash '"
                            ),
                            [
                                ts.factory.createTemplateSpan(
                                    ts.factory.createIdentifier("hash"),
                                    ts.factory.createTemplateTail(
                                        "' is not registered",
                                        "' is not registered"
                                    )
                                )
                            ]
                        ))
                    ])
                ),
                ts.factory.createReturnStatement(
                    ts.factory.createIdentifier("info")
                )
            ])
        )
    ];
}

function generateLoadMethods(): ts.ClassElement[] {
    return [
        ts.factory.createMethodDeclaration(
            [
                ts.factory.createToken(ts.SyntaxKind.PublicKeyword),
                ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)
            ],
            undefined,
            ts.factory.createIdentifier("loadModule"),
            undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier("module"),
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    undefined
                ),
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier("AppDomain"),
                    undefined,
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createIdentifier("AppDomain"),
                        undefined
                    ),
                    undefined
                )
            ],
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier("Promise"),
                [ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier("Record"),
                    [
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                    ]
                )]
            ),
            ts.factory.createBlock(
                [
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier("info"),
                                undefined,
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createThis(),
                                        ts.factory.createIdentifier("getChunkFromModule")
                                    ),
                                    undefined,
                                    [ts.factory.createIdentifier("module")]
                                )
                            )],
                            ts.NodeFlags.Const | ts.NodeFlags.AwaitContext | ts.NodeFlags.ContextFlags | ts.NodeFlags.TypeExcludesFlags
                        )
                    ),
                    ts.factory.createIfStatement(
                        ts.factory.createPrefixUnaryExpression(
                            ts.SyntaxKind.ExclamationToken,
                            ts.factory.createElementAccessExpression(
                                ts.factory.createIdentifier("info"),
                                ts.factory.createNumericLiteral("3")
                            )
                        ),
                        ts.factory.createBlock(
                            [
                                ts.factory.createExpressionStatement(ts.factory.createAwaitExpression(ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createThis(),
                                        ts.factory.createIdentifier("loadChunk")
                                    ),
                                    undefined,
                                    [ts.factory.createIdentifier("info")]
                                ))),
                                ts.factory.createExpressionStatement(ts.factory.createBinaryExpression(
                                    ts.factory.createElementAccessExpression(
                                        ts.factory.createIdentifier("info"),
                                        ts.factory.createNumericLiteral("3")
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                    ts.factory.createTrue()
                                ))
                            ],
                            true
                        ),
                        undefined
                    ),
                    ts.factory.createReturnStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createElementAccessExpression(
                                    ts.factory.createIdentifier("info"),
                                    ts.factory.createNumericLiteral("5")
                                ),
                                ts.factory.createIdentifier("loadModule")
                            ),
                            undefined,
                            [
                                ts.factory.createIdentifier("module"),
                                ts.factory.createIdentifier("AppDomain")
                            ]
                        )
                    )
                ],
                true
            )
        ),
        ts.factory.createMethodDeclaration([
                ts.factory.createToken(ts.SyntaxKind.PublicKeyword),
                ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)
            ],
            undefined,
            ts.factory.createIdentifier("loadBundle"),
            undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier("p"),
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    undefined
                )
            ],
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier("Promise"),
                [ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)]
            ),
            ts.factory.createBlock(
                [
                    ts.factory.createVariableStatement(
                        undefined,
                        [
                            ts.factory.createVariableDeclaration(
                                "map",
                                undefined,
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                                ts.factory.createAwaitExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createThis(),
                                            ts.factory.createIdentifier("loadFileMap")
                                        ),
                                        undefined,
                                        [ts.factory.createBinaryExpression(
                                            ts.factory.createIdentifier("p"),
                                            ts.factory.createToken(ts.SyntaxKind.PlusToken),
                                            ts.factory.createStringLiteral("/fm.json")
                                        )]
                                    )
                                )
                            )
                        ]
                    ),
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("map"),
                                ts.factory.createIdentifier("forEach")
                            ),
                            undefined,
                            [
                                ts.factory.createArrowFunction(
                                    undefined,
                                    undefined,
                                    [ts.factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        ts.factory.createIdentifier("e"),
                                        undefined,
                                        undefined,
                                        undefined
                                    )],
                                    undefined,
                                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                    ts.factory.createBinaryExpression(
                                        ts.factory.createElementAccessExpression(
                                            ts.factory.createIdentifier("e"),
                                            ts.factory.createNumericLiteral("0")
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                        ts.factory.createIdentifier("p")
                                    )
                                )
                            ]
                        )
                    ),
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createThis(),
                                    ts.factory.createIdentifier("chunks")
                                ),
                                ts.factory.createIdentifier("push")
                            ),
                            undefined,
                            [ts.factory.createSpreadElement(ts.factory.createIdentifier("map"))]
                        )
                    )
                ],
                true
            )
        )
    ]
}