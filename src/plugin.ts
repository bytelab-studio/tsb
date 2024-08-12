import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import {Project} from "./loader";

let project: Project;
let program: ts.Program;

export function setProject(_project: Project): void {
    project = _project;
}

export function setProgram(_program: ts.Program): void {
    program = _program;
}

class BasePlugin {
    protected get project(): Project {
        return project;
    }

    protected get program(): ts.Program {
        return program;
    }
}

export abstract class PlatformPlugin extends BasePlugin {


    public abstract generateChunkLoader(): ts.MethodDeclaration;

    public isFileIncluded(file: string): boolean {
        return false;
    }

    public getIncludeFiles(): string[] {
        const root: string = path.posix.join(process.cwd().replace(/\\/gi, "/"), "node_modules", "@bytelab.studio", "tsb-runtime");
        const packageJSON: any = JSON.parse(fs.readFileSync(path.posix.join(root, "package.json"), "utf8"));
        const runtime: string = path.posix.join(root, packageJSON.types);

        return [runtime];
    }

    public generateModuleHeader(): ts.Statement[] {
        return [];
    }

    public generateModuleAfterLoad(): ts.Statement[] {
        return []
    }

    public generateCustomLoaderProperties(): ts.Statement[] {
        return [];
    }

    public transformMember(statement: ts.Statement): ts.Statement {
        return statement;
    }
}

export abstract class TransformPlugin extends BasePlugin {
    private static _plugins: TransformPlugin[] = [];
    public static get plugins(): TransformPlugin[] {
        return this._plugins;
    }

    public abstract get flagName(): string;

    public abstract get flagDescription(): string;

    public transformSourceFile(sourceFile: ts.SourceFile): ts.SourceFile {
        return sourceFile;
    }

    public transformJavaScript(content: string): string {
        return content;
    }

    public static registerPlugin(plugin: TransformPlugin): void {
        this._plugins.push(plugin);
    }
}

export abstract class DataLoaderPlugin extends BasePlugin {
    private static _plugins: DataLoaderPlugin[] = [];
    public static get plugins(): DataLoaderPlugin[] {
        return this._plugins;
    }

    public abstract get platform(): PlatformPlugin[];

    public abstract condition(module: ts.Identifier): ts.Expression;

    public abstract body(module: ts.Identifier, cache: ts.Identifier): ts.Statement[];

    public fields(): ts.ClassElement[] {
        return [];
    }

    public static registerPlugin(plugin: DataLoaderPlugin): void {
        this._plugins.push(plugin);
    }
}

export abstract class AppDomainPlugin extends BasePlugin {
    private static _plugins: AppDomainPlugin[] = [];
    public static get plugins(): AppDomainPlugin[] {
        return this._plugins;
    }

    public abstract fields(): ts.ClassElement[];

    public static registerPlugin(plugin: AppDomainPlugin): void {
        this._plugins.push(plugin);
    }
}