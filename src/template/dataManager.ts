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

export function generateDataManager(platform: PlatformPlugin, chunkMap: ts.ArrayLiteralExpression): ts.ClassDeclaration {
    const factory: typeof ts.factory = ts.factory;

    return factory.createClassDeclaration(
        undefined,
        factory.createIdentifier("DataManager"),
        undefined,
        undefined,
        [
            factory.createPropertyDeclaration(
                [factory.createToken(ts.SyntaxKind.PrivateKeyword)],
                factory.createIdentifier("chunks"),
                undefined,
                factory.createArrayTypeNode(factory.createTypeReferenceNode(
                    factory.createIdentifier("ChunkInfo"),
                    undefined
                )),
                chunkMap
            ),
            factory.createMethodDeclaration(
                [factory.createToken(ts.SyntaxKind.PrivateKeyword)],
                undefined,
                factory.createIdentifier("getChunkFromModule"),
                undefined,
                undefined,
                [factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    factory.createIdentifier("module"),
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    undefined
                )],
                factory.createTypeReferenceNode(
                    factory.createIdentifier("ChunkInfo"),
                    undefined
                ),
                factory.createBlock(
                    [
                        factory.createVariableStatement(
                            undefined,
                            factory.createVariableDeclarationList(
                                [factory.createVariableDeclaration(
                                    factory.createIdentifier("info"),
                                    undefined,
                                    factory.createUnionTypeNode([
                                        factory.createTypeReferenceNode(
                                            factory.createIdentifier("ChunkInfo"),
                                            undefined
                                        ),
                                        factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                    ]),
                                    factory.createCallExpression(
                                        factory.createPropertyAccessExpression(
                                            factory.createPropertyAccessExpression(
                                                factory.createThis(),
                                                factory.createIdentifier("chunks")
                                            ),
                                            factory.createIdentifier("find")
                                        ),
                                        undefined,
                                        [factory.createArrowFunction(
                                            undefined,
                                            undefined,
                                            [factory.createParameterDeclaration(
                                                undefined,
                                                undefined,
                                                factory.createIdentifier("chunk"),
                                                undefined,
                                                undefined,
                                                undefined
                                            )],
                                            undefined,
                                            factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                            factory.createCallExpression(
                                                factory.createPropertyAccessExpression(
                                                    factory.createPropertyAccessExpression(
                                                        factory.createIdentifier("chunk"),
                                                        factory.createIdentifier("modules")
                                                    ),
                                                    factory.createIdentifier("includes")
                                                ),
                                                undefined,
                                                [factory.createIdentifier("module")]
                                            )
                                        )]
                                    )
                                )],
                                ts.NodeFlags.Const
                            )
                        ),
                        factory.createIfStatement(
                            factory.createPrefixUnaryExpression(
                                ts.SyntaxKind.ExclamationToken,
                                factory.createIdentifier("info")
                            ),
                            factory.createBlock(
                                [factory.createThrowStatement(factory.createTemplateExpression(
                                    factory.createTemplateHead(
                                        "Module '",
                                        "Module '"
                                    ),
                                    [factory.createTemplateSpan(
                                        factory.createIdentifier("module"),
                                        factory.createTemplateTail(
                                            "' is not registered in a chunk",
                                            "' is not registered in a chunk"
                                        )
                                    )]
                                ))],
                                true
                            ),
                            undefined
                        ),
                        factory.createReturnStatement(factory.createIdentifier("info"))
                    ],
                    true
                )
            ),
            factory.createMethodDeclaration(
                [factory.createToken(ts.SyntaxKind.PrivateKeyword)],
                undefined,
                factory.createIdentifier("getChunkFromHash"),
                undefined,
                undefined,
                [factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    factory.createIdentifier("hash"),
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    undefined
                )],
                factory.createTypeReferenceNode(
                    factory.createIdentifier("ChunkInfo"),
                    undefined
                ),
                factory.createBlock(
                    [
                        factory.createVariableStatement(
                            undefined,
                            factory.createVariableDeclarationList(
                                [factory.createVariableDeclaration(
                                    factory.createIdentifier("info"),
                                    undefined,
                                    factory.createUnionTypeNode([
                                        factory.createTypeReferenceNode(
                                            factory.createIdentifier("ChunkInfo"),
                                            undefined
                                        ),
                                        factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                    ]),
                                    factory.createCallExpression(
                                        factory.createPropertyAccessExpression(
                                            factory.createPropertyAccessExpression(
                                                factory.createThis(),
                                                factory.createIdentifier("chunks")
                                            ),
                                            factory.createIdentifier("find")
                                        ),
                                        undefined,
                                        [factory.createArrowFunction(
                                            undefined,
                                            undefined,
                                            [factory.createParameterDeclaration(
                                                undefined,
                                                undefined,
                                                factory.createIdentifier("chunk"),
                                                undefined,
                                                undefined,
                                                undefined
                                            )],
                                            undefined,
                                            factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                            factory.createBinaryExpression(
                                                factory.createPropertyAccessExpression(
                                                    factory.createIdentifier("chunk"),
                                                    factory.createIdentifier("hash")
                                                ),
                                                factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
                                                factory.createIdentifier("hash")
                                            )
                                        )]
                                    )
                                )],
                                ts.NodeFlags.Const
                            )
                        ),
                        factory.createIfStatement(
                            factory.createPrefixUnaryExpression(
                                ts.SyntaxKind.ExclamationToken,
                                factory.createIdentifier("info")
                            ),
                            factory.createBlock(
                                [factory.createThrowStatement(factory.createTemplateExpression(
                                    factory.createTemplateHead(
                                        "Chunk with the hash '",
                                        "Chunk with the hash '"
                                    ),
                                    [factory.createTemplateSpan(
                                        factory.createIdentifier("hash"),
                                        factory.createTemplateTail(
                                            "' is not registered",
                                            "' is not registered"
                                        )
                                    )]
                                ))],
                                true
                            ),
                            undefined
                        ),
                        factory.createReturnStatement(factory.createIdentifier("info"))
                    ],
                    true
                )
            ),
            factory.createMethodDeclaration(
                [
                    factory.createToken(ts.SyntaxKind.PublicKeyword),
                    factory.createToken(ts.SyntaxKind.AsyncKeyword)
                ],
                undefined,
                factory.createIdentifier("loadModule"),
                undefined,
                undefined,
                [
                    factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier("module"),
                        undefined,
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        undefined
                    ),
                    factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier("AppDomain"),
                        undefined,
                        factory.createTypeReferenceNode(
                            factory.createIdentifier("AppDomain"),
                            undefined
                        ),
                        undefined
                    )
                ],
                factory.createTypeReferenceNode(
                    factory.createIdentifier("Promise"),
                    [factory.createTypeReferenceNode(
                        factory.createIdentifier("Record"),
                        [
                            factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                            factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                        ]
                    )]
                ),
                factory.createBlock(
                    [
                        factory.createVariableStatement(
                            undefined,
                            factory.createVariableDeclarationList(
                                [factory.createVariableDeclaration(
                                    factory.createIdentifier("info"),
                                    undefined,
                                    factory.createTypeReferenceNode(
                                        factory.createIdentifier("ChunkInfo"),
                                        undefined
                                    ),
                                    factory.createCallExpression(
                                        factory.createPropertyAccessExpression(
                                            factory.createThis(),
                                            factory.createIdentifier("getChunkFromModule")
                                        ),
                                        undefined,
                                        [factory.createIdentifier("module")]
                                    )
                                )],
                                ts.NodeFlags.Const | ts.NodeFlags.AwaitContext | ts.NodeFlags.ContextFlags | ts.NodeFlags.TypeExcludesFlags
                            )
                        ),
                        factory.createIfStatement(
                            factory.createPrefixUnaryExpression(
                                ts.SyntaxKind.ExclamationToken,
                                factory.createPropertyAccessExpression(
                                    factory.createIdentifier("info"),
                                    factory.createIdentifier("loaded")
                                )
                            ),
                            factory.createBlock(
                                [factory.createExpressionStatement(factory.createAwaitExpression(factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createThis(),
                                        factory.createIdentifier("loadChunk")
                                    ),
                                    undefined,
                                    [factory.createIdentifier("info")]
                                ))), factory.createExpressionStatement(factory.createAssignment(factory.createPropertyAccessExpression(
                                    factory.createIdentifier("info"),
                                    factory.createIdentifier("loaded")
                                ), factory.createTrue()))],
                                true
                            ),
                            undefined
                        ),
                        factory.createReturnStatement(factory.createCallExpression(
                            factory.createPropertyAccessExpression(
                                factory.createNonNullExpression(factory.createPropertyAccessExpression(
                                    factory.createIdentifier("info"),
                                    factory.createIdentifier("holder")
                                )),
                                factory.createIdentifier("loadModule")
                            ),
                            undefined,
                            [
                                factory.createIdentifier("module"),
                                factory.createIdentifier("AppDomain")
                            ]
                        ))
                    ],
                    true
                )
            ),
            platform.generateChunkLoader(),
            factory.createMethodDeclaration(
                [factory.createToken(ts.SyntaxKind.PublicKeyword)],
                undefined,
                factory.createIdentifier("registerModule"),
                undefined,
                undefined,
                [
                    factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier("chunkHash"),
                        undefined,
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        undefined
                    ),
                    factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier("module"),
                        undefined,
                        factory.createTypeReferenceNode(
                            factory.createIdentifier("TSBModule"),
                            undefined
                        ),
                        undefined
                    )
                ],
                factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                factory.createBlock(
                    [
                        factory.createVariableStatement(
                            undefined,
                            factory.createVariableDeclarationList(
                                [factory.createVariableDeclaration(
                                    factory.createIdentifier("info"),
                                    undefined,
                                    factory.createTypeReferenceNode(
                                        factory.createIdentifier("ChunkInfo"),
                                        undefined
                                    ),
                                    factory.createAsExpression(
                                        factory.createCallExpression(
                                            factory.createPropertyAccessExpression(
                                                factory.createThis(),
                                                factory.createIdentifier("getChunkFromHash")
                                            ),
                                            undefined,
                                            [factory.createIdentifier("chunkHash")]
                                        ),
                                        factory.createTypeReferenceNode(
                                            factory.createIdentifier("ChunkInfo"),
                                            undefined
                                        )
                                    )
                                )],
                                ts.NodeFlags.Const
                            )
                        ),
                        factory.createExpressionStatement(factory.createBinaryExpression(
                            factory.createPropertyAccessExpression(
                                factory.createIdentifier("info"),
                                factory.createIdentifier("holder")
                            ),
                            factory.createToken(ts.SyntaxKind.EqualsToken),
                            factory.createIdentifier("module")
                        ))
                    ],
                    true
                )
            )
        ]
    );
}