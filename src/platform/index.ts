import {PlatformPlugin} from "../plugin";
import {BrowserPlatform} from "./browser";
import {NodeJSPlatform} from "./nodejs";

export namespace Platform {
    export const browser: PlatformPlugin = new BrowserPlatform();
    export const nodejs: PlatformPlugin = new NodeJSPlatform();
}