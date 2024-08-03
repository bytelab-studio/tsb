import * as ts from "typescript";
import {PlatformPlugin} from "../../plugin";
import {generateChunkLoader} from "./chunkLoader";

export class BrowserPlatform extends PlatformPlugin {
    public generateChunkLoader(): ts.MethodDeclaration {
        return generateChunkLoader();
    }

}