import * as ts from "typescript";
import {PlatformPlugin} from "../../plugin";
import {generateChunkLoader} from "./chunkLoader";
import {generateFileMapLoader} from "./fileMapLoader";

export class BrowserPlatform extends PlatformPlugin {
    public generateChunkLoader(): ts.MethodDeclaration {
        return generateChunkLoader();
    }

    public generateFileMapLoader(): ts.MethodDeclaration {
        return generateFileMapLoader()
    }

    public generateInitFileMapCall(): ts.CallExpression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("AppDomain"),
                    ts.factory.createIdentifier("primaryDomain")
                ),
                ts.factory.createIdentifier("loadBundle")
            ),
            undefined,
            [
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("document"),
                                ts.factory.createIdentifier("currentScript")
                            ),
                            ts.factory.createIdentifier("src")
                        ),
                        ts.factory.createIdentifier("substring")
                    ),
                    undefined,
                    [
                        ts.factory.createNumericLiteral("0"),
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("document"),
                                        ts.factory.createIdentifier("currentScript")
                                    ),
                                    ts.factory.createIdentifier("src")
                                ),
                                ts.factory.createIdentifier("lastIndexOf")
                            ),
                            undefined,
                            [ts.factory.createStringLiteral("/")]
                        )
                    ]
                )
            ]
        )
    }

}