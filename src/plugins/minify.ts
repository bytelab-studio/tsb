import {TransformPlugin} from "../plugin";
import * as uglify from "uglify-js";

class Minify extends TransformPlugin {
    public get flagName(): string {
        return "minify";
    }

    public get flagDescription(): string {
        return "Minifies the JavaScript output";
    }

    public transformJavaScript(content: string): string {
        return uglify.minify(content, {
            sourceMap: false
        }).code;
    }

    static {
        TransformPlugin.registerPlugin(new Minify());
    }
}

export {}