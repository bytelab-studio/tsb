import {Identifier, Expression, Statement} from "typescript";
import {DataLoaderPlugin, PlatformPlugin} from "../plugin";
import {Platform} from "../platform";
import * as ts from "typescript";

class ResourceLoader extends DataLoaderPlugin {
    public get platform(): PlatformPlugin[] {
        return [Platform.nodejs, Platform.browser];
    }

    public condition(module: Identifier): Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                module,
                ts.factory.createIdentifier("startsWith")
            ),
            undefined,
            [
                ts.factory.createStringLiteral("res://")
            ]
        )
    }

    public body(module: Identifier, cache: Identifier): Statement[] {
        return [
            ts.factory.createReturnStatement(
                ts.factory.createAwaitExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createThis(),
                            ts.factory.createIdentifier("resolve")
                        ),
                        undefined,
                        [
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("AppDomain"),
                                        ts.factory.createIdentifier("dataManager")
                                    ),
                                    ts.factory.createIdentifier("getHashFromPath")
                                ),
                                undefined,
                                [
                                    module
                                ]
                            )
                        ]
                    )
                )
            )
        ];
    }

    static {
        DataLoaderPlugin.registerPlugin(new ResourceLoader());
    }
}