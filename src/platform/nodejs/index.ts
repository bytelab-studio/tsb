import * as ts from "typescript";
import {PlatformPlugin} from "../../plugin";
import {generateChunkLoader} from "./chunkLoader";
import {generateModuleHeader} from "./moduleHeader";
import {generateFileMapLoader} from "./fileMapLoader";

export class NodeJSPlatform extends PlatformPlugin {
    public generateChunkLoader(): ts.MethodDeclaration {
        return generateChunkLoader();
    }

    public generateFileMapLoader(): ts.MethodDeclaration {
        return generateFileMapLoader();
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
                ts.factory.createIdentifier("__dirname")
            ]
        )
    }

    public generateModuleHeader(): ts.Statement[] {
        return generateModuleHeader(this.project.moduleName);
    }

    generateCustomLoaderProperties(): ts.Statement[] {
        return [
            ts.factory.createExpressionStatement(
                ts.factory.createAssignment(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("exports"),
                        ts.factory.createIdentifier("TSBModule")
                    ),
                    ts.factory.createIdentifier("TSBModule")
                )
            )
        ];
    }
}