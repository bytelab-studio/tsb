import {Identifier, Expression, Statement} from "typescript";
import {DataLoaderPlugin, PlatformPlugin} from "../plugin";
import {Platform} from "../platform";
import * as ts from "typescript";

class NodejsLoader extends DataLoaderPlugin {
    public get platform(): PlatformPlugin[] {
        return [Platform.nodejs];
    }

    public condition(module: Identifier): Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                module,
                ts.factory.createIdentifier("startsWith")
            ),
            undefined,
            [
                ts.factory.createStringLiteral("node:")
            ]
        );
    }

    public body(module: ts.Identifier, cache: Identifier): Statement[] {
        const factory: typeof ts.factory = ts.factory;
        return [
            factory.createExpressionStatement(
                factory.createAssignment(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("require"),
                        factory.createIdentifier("cache")
                    ),
                    factory.createPropertyAccessExpression(
                        factory.createThis(),
                        factory.createIdentifier("requireCache")
                    )
                )
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
                        factory.createCallExpression(
                            factory.createIdentifier("require"),
                            undefined,
                            [
                                factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        module,
                                        factory.createIdentifier("substring")
                                    ),
                                    undefined,
                                    [
                                        factory.createNumericLiteral(5)
                                    ]
                                )
                            ]
                        )
                    )],
                    ts.NodeFlags.Const
                )
            ),
            factory.createExpressionStatement(factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    factory.createPropertyAccessExpression(
                        factory.createThis(),
                        cache
                    ),
                    factory.createIdentifier("set")
                ),
                undefined,
                [
                    module,
                    factory.createIdentifier("exports")
                ]
            )),
            factory.createReturnStatement(factory.createIdentifier("exports"))
        ];
    }

    fields(): ts.ClassElement[] {
        return [
            ts.factory.createPropertyDeclaration(
                [ts.factory.createToken(ts.SyntaxKind.PrivateKeyword)],
                "requireCache",
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                ts.factory.createObjectLiteralExpression()
            )
        ]
    }

    static {
        DataLoaderPlugin.registerPlugin(new NodejsLoader());
    }
}

export {};