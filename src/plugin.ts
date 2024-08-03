import * as ts from "typescript";
import {Project} from "./loader";

export abstract class PlatformPlugin {
    protected project: Project = {} as Project;

    public abstract generateChunkLoader(): ts.MethodDeclaration;

    public resolveFiles(): string[] {
        return [];
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

    public setData(project: Project): void {
        this.project = project;
    }
}

export abstract class TransformPlugin {
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

export abstract class DataLoaderPlugin {
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

export abstract class AppDomainPlugin {
    private static _plugins: AppDomainPlugin[] = [];
    public static get plugins(): AppDomainPlugin[] {
        return this._plugins;
    }

    public abstract fields(): ts.ClassElement[];

    public static registerPlugin(plugin: AppDomainPlugin): void {
        this._plugins.push(plugin);
    }
}