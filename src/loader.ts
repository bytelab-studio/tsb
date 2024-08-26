import * as fs from "fs";
import *  as path from "path";
import * as ts from "typescript";
import * as fnv from "fnv-plus";
import {stringify} from "node:querystring";
import {throwError} from "./error";
import {PlatformPlugin, TransformPlugin} from "./plugin";

export interface BuildConfig {
    // Options
    moduleName: string;
    moduleFiles: string[];
    platformName: string;
    requestHelp: boolean;
    entryFile: string|undefined;
    outPath: string;
    chunkSize: number;
    useBuilder: boolean;
    embeddedFileMap: boolean;
    emitDeclaration: boolean;
    transformPlugins: TransformPlugin[];

    // Holder
    config: ts.CompilerOptions;
    fileMap: FileMap;
    project: Project;
    program: ts.Program;
    platform: PlatformPlugin;
}

export interface Project {
    files: string[];
    map: FileMap;
    moduleName: string;
}

export type FileMapEntry = {
    file: string;
    resource: string;
    hash: string;
}

export type FileMap = FileMapEntry[];

export function loadDir(dir: string, source: boolean = true, declaration: boolean = true): string[] {
    if (fs.existsSync(dir) && !fs.statSync(dir).isDirectory()) {
        throwError("Directory does not exist or is not a directory");
    }

    function __loader__(dir: string): string[] {
        const res: string[] = [];
        fs.readdirSync(dir).forEach(item => {
            item = path.posix.join(dir, item);
            if (fs.statSync(item).isDirectory()) {
                res.push(...__loader__(item));
            } else if (
                source && item.endsWith(".ts") && !item.endsWith(".d.ts") ||
                declaration && item.endsWith(".d.ts")
            ) {
                res.push(item);
            }
        });
        return res;
    }

    return __loader__(dir);

}

export function loadFiles(files: string[], moduleName: string): Project {
    files = files.map(file => {
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
            throwError(`File '${file}' does not exist or is not a file`);
        }
        if (path.isAbsolute(file)) {
            return file.replace(/\\/gi, "/");
        }
        return path.posix.join(process.cwd().replace(/\\/gi, "/"), file);
    });

    return {
        moduleName: moduleName,
        files: files,
        map: generateFileMap(files, "res://", moduleName)
    }
}

function generateFileMap(files: string[], prefix: string, moduleName: string): FileMap {
    files = files.filter(f => !f.endsWith(".d.ts"));

    if (files.length == 1) {
        return [
            {
                file: files[0],
                resource: prefix + moduleName + "/" + path.basename(files[0]),
                hash: fnv.hash(files[0]).str()
            }
        ]
    }

    function commonPrefix(files: string[]): string {
        if (files.length == 0) {
            return "";
        }
        let prefix: string = files[0];
        for (let i: number = 1; i < files.length; i++) {
            while (files[i].indexOf(prefix) != 0) {
                prefix = prefix.substring(0, prefix.lastIndexOf("/"));
                if (prefix == "") {
                    return "";
                }
            }
        }
        return prefix;
    }

    const minPath: string = commonPrefix(files);
    return files.map(f => {
        return {
            file: f,
            resource: minPath && f.startsWith(minPath) ? prefix + moduleName + f.slice(minPath.length) : prefix + moduleName + f,
            hash: fnv.hash(f).str()
        }
    });
}

export function loadProgram(buildConfig: BuildConfig): void {
    buildConfig.program = ts.createProgram(buildConfig.project.files, buildConfig.config);
}

export function isMetaFile(file: string): boolean {
    return file.endsWith(".d.ts")
}

export function isSourceFile(file: string): boolean {
    return file.endsWith(".ts") && !file.endsWith(".d.ts");
}