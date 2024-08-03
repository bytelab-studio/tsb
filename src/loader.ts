import * as fs from "fs";
import *  as path from "path";
import * as ts from "typescript";
import * as fnv from "fnv-plus";
import {stringify} from "node:querystring";
import {throwError} from "./error";

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
            item = path.join(dir, item);
            if (fs.statSync(item).isDirectory()) {
                res.push(...__loader__(item));
            } else if (
                source && item.endsWith(".ts") && !item.endsWith(".d.ts") ||
                declaration && item.endsWith(".d.ts")
            ) {
                res.push(item.replace(/\\/g, "/"));
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
        return path.join(process.cwd(), file).replace(/\\/g, "/");
    });

    return {
        moduleName: moduleName,
        files: files,
        map: generateFileMap(files, "res://")
    }
}

function generateFileMap(files: string[], prefix: string): FileMap {
    files = files.filter(f => !f.endsWith(".d.ts"));

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
            resource: minPath && f.startsWith(minPath) ? prefix + f.slice(minPath.length) : prefix + f,
            hash: fnv.hash(f).str()
        }
    });
}

export function loadProgram(project: Project, config: ts.CompilerOptions): ts.Program {
    return ts.createProgram(project.files, config);
}