import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import {OptionFlagArgument, OptionSet} from "@koschel-christoph/node.options";
import {FileMapEntry, isMetaFile, isSourceFile, loadFiles, loadProgram, Project} from "../loader";
import {transformToModule} from "../transformer";
import {emitModule} from "../emit";
import {throwError} from "../error";
import {Platform} from "../platform";
import {PlatformPlugin, setProgram, setProject, TransformPlugin} from "../plugin";
import {loadBuilderScript} from "../builder";

import "../plugins";

function convertCompilerOptionsToJson(conf: ts.CompilerOptions): any {
    const options: any = {};
    for (const [key, value] of Object.entries(conf)) {
        if (key == "pathsBasePath") {
            continue;
        }
        switch (key) {
            case "target":
                options[key] = ts.ScriptTarget[value as number];
                break;
            case "module":
                options[key] = ts.ModuleKind[value as number];
                break;
            default:
                options[key] = value;
        }
    }

    return options;
}

export default function build(args: string[]): void {
    let moduleName: string = "app";
    const moduleFiles: string[] = [];
    let platformName: string | undefined;
    let requestHelp: boolean = false;
    let entryFile: string | undefined;
    let outPath: string = "out";
    let chunkSize: number = 10_000;
    let useBuilder: boolean = false;
    let embeddedFileMap: boolean = false;
    const transformPlugins: TransformPlugin[] = [];

    const options: OptionSet = new OptionSet(
        "Usage: tsb build <files> [options]",
        ["m=|module=", "The module {name}", v => moduleName = v],
        ["<>", "The files to be compiled", v => moduleFiles.push(v)],
        ["p=|platform=", "The target {platform}", v => platformName = v],
        ["e=|entry=", "The entry {file}", v => entryFile = v],
        ["o=|output=", "The output {path}", v => outPath = v],
        ["chunk-size=", "Sets the minimal chunk size in {bytes}", v => {
            if (isNaN(parseInt(v))) {
                return;
            }
            chunkSize = parseInt(v);
        }],
        ["embedded-file-map", "Includes the file map into the loader", () => embeddedFileMap = true],
        ["script", "Use tsb.js definition in the CWD", () => useBuilder = true],
        ["h|help", "Prints this help string", () => requestHelp = true],
        ...TransformPlugin.plugins.map((plugin: TransformPlugin): OptionFlagArgument => ["plugin-" + plugin.flagName, plugin.flagDescription, () => transformPlugins.push(plugin)])
    )

    options.parse(args, false);
    if (requestHelp) {
        options.printHelpString(process.stdout);
        return;
    }
    if (useBuilder) {
        build(loadBuilderScript());
        return;
    }
    if (!platformName) {
        console.log("Missing platform flag\n");
        options.printHelpString(process.stdout);
        return;
    }

    if (moduleFiles.length == 0) {
        console.log("Needs at least one source file\n");
        options.printHelpString(process.stdout);
        return;
    }

    if (!Object.keys(Platform).includes(platformName)) {
        throwError(`Unknown platform '${platformName}' available are ${Object.keys(Platform).map(k => `'${k}'`).join(", ")}`);
    }

    if (entryFile) {
        if (!fs.existsSync(entryFile) || !fs.statSync(entryFile).isFile()) {
            throwError(`File '${entryFile}' does not exist or is not a file`);
        }
        entryFile = path.posix.join(process.cwd().replace(/\\/gi, "/"), entryFile);
    }

    const platform: PlatformPlugin = (Platform as any)[platformName] as PlatformPlugin;

    const project: Project = loadFiles([...platform.getIncludeFiles(), ...moduleFiles], moduleName);
    setProject(project);

    if (entryFile && !project.map.find(e => e.file == entryFile)) {
        throwError("Entry file is not included in the bundle");
    }
    const tsconfig: any = JSON.parse(fs.readFileSync(path.join(process.cwd(), "tsconfig.json"), "utf8"));
    const config: ts.CompilerOptions = ts.parseJsonConfigFileContent(tsconfig, {
        useCaseSensitiveFileNames: true,
        fileExists(path: string): boolean {
            return fs.existsSync(path) && fs.statSync(path).isFile();
        },
        readDirectory(rootDir: string, extensions: readonly string[], excludes: readonly string[] | undefined, includes: readonly string[], depth?: number): readonly string[] {
            let items: string[] = fs.readdirSync(rootDir);
            items = items.filter(i => extensions.map(e => i.endsWith(e)).reduce((a, b) => a && b));
            return items;
        },
        readFile(path: string): string | undefined {
            return fs.readFileSync(path, "utf8");
        }

    }, process.cwd()).options;

    config.module = ts.ModuleKind.CommonJS;
    config.forceConsistentCasingInFileNames = true;
    config.strict = true;
    config.alwaysStrict = true;

    if (!tsconfig.include) {
        tsconfig.include = [];
    }
    if (!tsconfig.include.includes("node_modules/@bytelab.studio/tsb-runtime/**/index.d.ts")) {
        tsconfig.include.push("node_modules/@bytelab.studio/tsb-runtime/**/index.d.ts");
    }
    if (!tsconfig.include.includes("tsb.ts")) {
        tsconfig.include.push("tsb.ts");
    }
    if (!config.paths) {
        config.paths = {};
    }
    config.paths.tsb = ["./node_modules/@bytelab.studio/tsb-runtime/types/index.d.ts"]

    fs.writeFileSync(path.join(process.cwd(), "tsconfig.json"), JSON.stringify({
        compilerOptions: convertCompilerOptionsToJson(config),
        files: moduleFiles.filter(f => !f.startsWith("node_modules")),
        include: tsconfig.include
    }, null, 4));

    const program: ts.Program = loadProgram(project, config);
    setProgram(program);

    program.getSourceFiles().map(s => s.fileName).forEach(file => {
        if (isMetaFile(file)) {
            return;
        }
        if (!isSourceFile(file)) {
            return;
        }
        if (!project.files.includes(file) && !platform.isFileIncluded(file)) {
            console.log(`WARNING: Loading file '${file}' which is not content of the bundle`);
        }
    });

    const allDiagnostics: readonly ts.Diagnostic[] = ts.getPreEmitDiagnostics(program).concat(program.emit(undefined, fileName => void 0).diagnostics);
    if (allDiagnostics.length != 0) {
        allDiagnostics.forEach(diagnostic => {
            if (diagnostic.file) {
                let {line, character} = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
                let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            } else {
                console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
            }
        });
        process.exit(1);
    }

    const modules: ts.SourceFile[] = [];
    for (let i: number = 0; i < project.map.length; i++) {
        const info: FileMapEntry = project.map[i];
        let sourceFile: ts.SourceFile = program.getSourceFile(info.file)!;
        modules[i] = transformToModule(sourceFile, info, project, platform, transformPlugins);
    }
    emitModule(
        project,
        modules,
        platform,
        transformPlugins,
        config,
        path.join(process.cwd(), outPath),
        moduleName,
        chunkSize,
        embeddedFileMap,
        !!entryFile ? project.map.find(e => e.file == entryFile)!.hash : undefined
    );
}