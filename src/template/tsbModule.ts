import * as ts from "typescript";

/*


class TSBModule {
    private modules: Record<string, TSB.ModuleCallback> = {}

    public constructor(hash: string) {
        AppDomain.registerModule(hash, this);
    }

    public define(hash: string, cb: TSB.ModuleCallback): void {
        this.modules[hash] = cb;
    }

    public loadModule(module: string, AppDomain: AppDomain): Record<string, any> {
        const cb: TSB.ModuleCallback = this.modules[module];
        if (!cb) {
            throw `Unknown module '${module}'`;
        }
        const exports: Record<string, any> = {};
        cb(exports, AppDomain);
        return exports;
    }
}

 */

export function generateTSBModule(): ts.ClassDeclaration {
    const factory: typeof ts.factory = ts.factory;

    return factory.createClassDeclaration(
        undefined,
        factory.createIdentifier("TSBModule"),
        undefined,
        undefined,
        [
            factory.createPropertyDeclaration(
                [factory.createToken(ts.SyntaxKind.PrivateKeyword)],
                factory.createIdentifier("modules"),
                undefined,
                factory.createTypeReferenceNode(
                    factory.createIdentifier("Record"),
                    [
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        factory.createTypeReferenceNode(
                            factory.createQualifiedName(
                                factory.createIdentifier("TSB"),
                                factory.createIdentifier("ModuleCallback")
                            ),
                            undefined
                        )
                    ]
                ),
                factory.createObjectLiteralExpression(
                    [],
                    false
                )
            ),
            factory.createConstructorDeclaration(
                [factory.createToken(ts.SyntaxKind.PublicKeyword)],
                [factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    factory.createIdentifier("hash"),
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    undefined
                )],
                factory.createBlock(
                    [factory.createExpressionStatement(factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createIdentifier("AppDomain"),
                            factory.createIdentifier("registerModule")
                        ),
                        undefined,
                        [
                            factory.createIdentifier("hash"),
                            factory.createThis()
                        ]
                    ))],
                    true
                )
            ),
            factory.createMethodDeclaration(
                [factory.createToken(ts.SyntaxKind.PublicKeyword)],
                undefined,
                factory.createIdentifier("define"),
                undefined,
                undefined,
                [
                    factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier("hash"),
                        undefined,
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        undefined
                    ),
                    factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier("cb"),
                        undefined,
                        factory.createTypeReferenceNode(
                            factory.createQualifiedName(
                                factory.createIdentifier("TSB"),
                                factory.createIdentifier("ModuleCallback")
                            ),
                            undefined
                        ),
                        undefined
                    )
                ],
                factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                factory.createBlock(
                    [factory.createExpressionStatement(factory.createBinaryExpression(
                        factory.createElementAccessExpression(
                            factory.createPropertyAccessExpression(
                                factory.createThis(),
                                factory.createIdentifier("modules")
                            ),
                            factory.createIdentifier("hash")
                        ),
                        factory.createToken(ts.SyntaxKind.EqualsToken),
                        factory.createIdentifier("cb")
                    ))],
                    true
                )
            ),
            factory.createMethodDeclaration(
                [factory.createToken(ts.SyntaxKind.PublicKeyword), factory.createToken(ts.SyntaxKind.AsyncKeyword)],
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
                    factory.createIdentifier("Record"),
                    [
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                    ]
                ),
                factory.createBlock(
                    [
                        factory.createVariableStatement(
                            undefined,
                            factory.createVariableDeclarationList(
                                [factory.createVariableDeclaration(
                                    factory.createIdentifier("cb"),
                                    undefined,
                                    factory.createTypeReferenceNode(
                                        factory.createQualifiedName(
                                            factory.createIdentifier("TSB"),
                                            factory.createIdentifier("ModuleCallback")
                                        ),
                                        undefined
                                    ),
                                    factory.createElementAccessExpression(
                                        factory.createPropertyAccessExpression(
                                            factory.createThis(),
                                            factory.createIdentifier("modules")
                                        ),
                                        factory.createIdentifier("module")
                                    )
                                )],
                                ts.NodeFlags.Const
                            )
                        ),
                        factory.createIfStatement(
                            factory.createPrefixUnaryExpression(
                                ts.SyntaxKind.ExclamationToken,
                                factory.createIdentifier("cb")
                            ),
                            factory.createBlock(
                                [factory.createThrowStatement(factory.createTemplateExpression(
                                    factory.createTemplateHead(
                                        "Unknown module '",
                                        "Unknown module '"
                                    ),
                                    [factory.createTemplateSpan(
                                        factory.createIdentifier("module"),
                                        factory.createTemplateTail(
                                            "'",
                                            "'"
                                        )
                                    )]
                                ))],
                                true
                            ),
                            undefined
                        ),
                        factory.createVariableStatement(
                            undefined,
                            factory.createVariableDeclarationList(
                                [factory.createVariableDeclaration(
                                    factory.createIdentifier("exports"),
                                    undefined,
                                    factory.createTypeReferenceNode(
                                        factory.createIdentifier("Record"),
                                        [
                                            factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                            factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                        ]
                                    ),
                                    factory.createObjectLiteralExpression(
                                        [],
                                        false
                                    )
                                )],
                                ts.NodeFlags.Const
                            )
                        ),
                        factory.createExpressionStatement(
                            factory.createAwaitExpression(
                                factory.createCallExpression(
                                    factory.createIdentifier("cb"),
                                    undefined,
                                    [
                                        factory.createIdentifier("exports"),
                                        factory.createIdentifier("AppDomain")
                                    ]
                                )
                            )
                        ),
                        factory.createReturnStatement(factory.createIdentifier("exports"))
                    ],
                    true
                )
            )
        ]
    );
}