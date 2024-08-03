import * as ts from "typescript";
import {AppDomainPlugin, DataLoaderPlugin, PlatformPlugin} from "../plugin";


/*

class AppDomain {
    private static readonly dataManager: DataManager = new DataManager();

    public static readonly primaryDomain: AppDomain = new AppDomain();

    private cache: Map<string, Record<string, any>> = new Map<string, Record<string, any>>();

    public async resolve(module: string): Promise<Record<string, any>> {
        if (this.cache.has(module)) {
            return this.cache.get(module)!;
        }

        const exports: Record<string, any> = await AppDomain.dataManager.loadModule(module, this);
        this.cache.set(module, exports);
        return exports;
    }

    public static registerModule(hash: string, module: TSBModule): void {
        this.dataManager.registerModule(hash, module);
    }
}


 */

export function generateAppDomain(platform: PlatformPlugin): ts.ClassDeclaration {
    const plugins: DataLoaderPlugin[] = DataLoaderPlugin.plugins.filter(p => p.platform.includes(platform));
    const factory: typeof ts.factory = ts.factory;

    return factory.createClassDeclaration(
        undefined,
        factory.createIdentifier("AppDomain"),
        undefined,
        undefined,
        [
            factory.createPropertyDeclaration(
                [
                    factory.createToken(ts.SyntaxKind.PrivateKeyword),
                    factory.createToken(ts.SyntaxKind.StaticKeyword),
                    factory.createToken(ts.SyntaxKind.ReadonlyKeyword)
                ],
                factory.createIdentifier("dataManager"),
                undefined,
                factory.createTypeReferenceNode(
                    factory.createIdentifier("DataManager"),
                    undefined
                ),
                factory.createNewExpression(
                    factory.createIdentifier("DataManager"),
                    undefined,
                    []
                )
            ),
            factory.createPropertyDeclaration(
                [
                    factory.createToken(ts.SyntaxKind.PublicKeyword),
                    factory.createToken(ts.SyntaxKind.StaticKeyword),
                    factory.createToken(ts.SyntaxKind.ReadonlyKeyword)
                ],
                factory.createIdentifier("primaryDomain"),
                undefined,
                factory.createTypeReferenceNode(
                    factory.createIdentifier("AppDomain"),
                    undefined
                ),
                factory.createNewExpression(
                    factory.createIdentifier("AppDomain"),
                    undefined,
                    []
                )
            ),
            factory.createPropertyDeclaration(
                [factory.createToken(ts.SyntaxKind.PrivateKeyword)],
                factory.createIdentifier("cache"),
                undefined,
                factory.createTypeReferenceNode(
                    factory.createIdentifier("Map"),
                    [
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        factory.createTypeReferenceNode(
                            factory.createIdentifier("Record"),
                            [
                                factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                            ]
                        )
                    ]
                ),
                factory.createNewExpression(
                    factory.createIdentifier("Map"),
                    [
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        factory.createTypeReferenceNode(
                            factory.createIdentifier("Record"),
                            [
                                factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                            ]
                        )
                    ],
                    []
                )
            ),
            ...plugins.map(p => p.fields()).flat(),
            ...AppDomainPlugin.plugins.map(p => p.fields()).flat(),
            factory.createMethodDeclaration(
                [
                    factory.createToken(ts.SyntaxKind.PublicKeyword),
                    factory.createToken(ts.SyntaxKind.AsyncKeyword)
                ],
                undefined,
                factory.createIdentifier("resolve"),
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
                        factory.createIfStatement(
                            factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createThis(),
                                        factory.createIdentifier("cache")
                                    ),
                                    factory.createIdentifier("has")
                                ),
                                undefined,
                                [factory.createIdentifier("module")]
                            ),
                            factory.createBlock(
                                [factory.createReturnStatement(factory.createNonNullExpression(factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createPropertyAccessExpression(
                                            factory.createThis(),
                                            factory.createIdentifier("cache")
                                        ),
                                        factory.createIdentifier("get")
                                    ),
                                    undefined,
                                    [factory.createIdentifier("module")]
                                )))],
                                true
                            ),
                            undefined
                        ),
                        ...plugins.map(p => factory.createIfStatement(
                            p.condition(factory.createIdentifier("module")),
                            factory.createBlock([
                                ...p.body(factory.createIdentifier("module"), factory.createIdentifier("cache"))
                            ])
                        )),
                        factory.createVariableStatement(
                            undefined,
                            factory.createVariableDeclarationList([
                                    factory.createVariableDeclaration(
                                        factory.createIdentifier("exports"),
                                        undefined,
                                        factory.createTypeReferenceNode(
                                            factory.createIdentifier("Record"),
                                            [
                                                factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                                factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                            ]
                                        ),
                                        factory.createAwaitExpression(factory.createCallExpression(
                                            factory.createPropertyAccessExpression(
                                                factory.createPropertyAccessExpression(
                                                    factory.createIdentifier("AppDomain"),
                                                    factory.createIdentifier("dataManager")
                                                ),
                                                factory.createIdentifier("loadModule")
                                            ),
                                            undefined,
                                            [
                                                factory.createIdentifier("module"),
                                                factory.createThis()
                                            ]
                                        ))
                                    )],
                                ts.NodeFlags.Const | ts.NodeFlags.AwaitContext | ts.NodeFlags.ContextFlags | ts.NodeFlags.TypeExcludesFlags
                            )
                        ),
                        factory.createExpressionStatement(factory.createCallExpression(
                            factory.createPropertyAccessExpression(
                                factory.createPropertyAccessExpression(
                                    factory.createThis(),
                                    factory.createIdentifier("cache")
                                ),
                                factory.createIdentifier("set")
                            ),
                            undefined,
                            [
                                factory.createIdentifier("module"),
                                factory.createIdentifier("exports")
                            ]
                        )),
                        factory.createReturnStatement(factory.createIdentifier("exports"))
                    ],
                    true
                )
            ),
            factory.createMethodDeclaration(
                [
                    factory.createToken(ts.SyntaxKind.PublicKeyword),
                    factory.createToken(ts.SyntaxKind.StaticKeyword)
                ],
                undefined,
                factory.createIdentifier("registerModule"),
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
                    [factory.createExpressionStatement(factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createPropertyAccessExpression(
                                factory.createThis(),
                                factory.createIdentifier("dataManager")
                            ),
                            factory.createIdentifier("registerModule")
                        ),
                        undefined,
                        [
                            factory.createIdentifier("hash"),
                            factory.createIdentifier("module")
                        ]
                    ))],
                    true
                )
            )
        ]
    );
}