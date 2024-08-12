import * as ts from "typescript";
import {PlatformPlugin} from "../../plugin";
import {generateChunkLoader} from "./chunkLoader";
import {generateModuleHeader} from "./moduleHeader";
import {loadDir} from "../../loader";

export class NodeJSPlatform extends PlatformPlugin {
    public generateChunkLoader(): ts.MethodDeclaration {
        return generateChunkLoader();
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