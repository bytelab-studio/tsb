import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import {OptionFlagArgument, OptionSet} from "@koschel-christoph/node.options";
import {BuildConfig, FileMap, FileMapEntry, isMetaFile, isSourceFile, loadFiles, loadProgram, Project} from "../loader";
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
    const buildConfig: BuildConfig = {
        moduleName: "app",
        moduleFiles: [],
        platformName: "",
        requestHelp: false,
        entryFile: undefined,
        outPath: "out",
        chunkSize: 10_000,
        useBuilder: false,
        embeddedFileMap: false,
        emitDeclaration: false,
        transformPlugins: [],

        config: undefined as unknown as ts.CompilerOptions,
        fileMap: undefined as unknown as FileMap,
        project: undefined as unknown as Project,
        program: undefined as unknown as ts.Program,
        platform: undefined as unknown as PlatformPlugin,

    }
    // let moduleName: string = "app";
    // const moduleFiles: string[] = [];
    // let platformName: string | undefined;
    // let requestHelp: boolean = false;
    // let entryFile: string | undefined;
    // let outPath: string = "out";
    // let chunkSize: number = 10_000;
    // let useBuilder: boolean = false;
    // let embeddedFileMap: boolean = false;
    // let emitDeclarations: boolean = false;
    // const transformPlugins: TransformPlugin[] = [];

    const options: OptionSet = new OptionSet(
        "Usage: tsb build <files> [options]",
        ["m=|module=", "The module {name}", v => buildConfig.moduleName = v],
        ["<>", "The files to be compiled", v => buildConfig.moduleFiles.push(v)],
        ["p=|platform=", "The target {platform}", v => buildConfig.platformName = v],
        ["e=|entry=", "The entry {file}", v => buildConfig.entryFile = v],
        ["o=|output=", "The output {path}", v => buildConfig.outPath = v],
        ["chunk-size=", "Sets the minimal chunk size in {bytes}", v => {
            if (isNaN(parseInt(v))) {
                return;
            }
            buildConfig.chunkSize = parseInt(v);
        }],
        ["embedded-file-map", "Includes the file map into the loader", () => buildConfig.embeddedFileMap = true],
        ["d|declaration", "Emit declaration files", () => buildConfig.emitDeclaration = true],
        ["script", "Use tsb.js definition in the CWD", () => buildConfig.useBuilder = true],
        ["h|help", "Prints this help string", () => buildConfig.requestHelp = true],
        ...TransformPlugin.plugins.map((plugin: TransformPlugin): OptionFlagArgument => ["plugin-" + plugin.flagName, plugin.flagDescription, () => buildConfig.transformPlugins.push(plugin)])
    )

    options.parse(args, false);
    if (buildConfig.requestHelp) {
        options.printHelpString(process.stdout);
        return;
    }
    if (buildConfig.useBuilder) {
        build(loadBuilderScript());
        return;
    }
    if (buildConfig.platformName != "") {
        console.log("Missing platform flag\n");
        options.printHelpString(process.stdout);
        return;
    }

    if (buildConfig.moduleFiles.length == 0) {
        console.log("Needs at least one source file\n");
        options.printHelpString(process.stdout);
        return;
    }

    if (!Object.keys(Platform).includes(buildConfig.platformName)) {
        throwError(`Unknown platform '${buildConfig.platformName}' available are ${Object.keys(Platform).map(k => `'${k}'`).join(", ")}`);
    }

    if (buildConfig.entryFile) {
        if (!fs.existsSync(buildConfig.entryFile) || !fs.statSync(buildConfig.entryFile).isFile()) {
            throwError(`File '${buildConfig.entryFile}' does not exist or is not a file`);
        }
        buildConfig.entryFile = path.posix.join(process.cwd().replace(/\\/gi, "/"), buildConfig.entryFile);
    }

    buildConfig.platform = (Platform as any)[buildConfig.platformName] as PlatformPlugin
    buildConfig.project = loadFiles([...buildConfig.platform.getIncludeFiles(), ...buildConfig.moduleFiles], buildConfig.moduleName);
    setProject(buildConfig.project);

    if (buildConfig.entryFile && !buildConfig.project.map.find(e => e.file == buildConfig.entryFile)) {
        throwError("Entry file is not included in the bundle");
    }
    const tsconfig: any = JSON.parse(fs.readFileSync(path.join(process.cwd(), "tsconfig.json"), "utf8"));
    buildConfig.config = ts.parseJsonConfigFileContent(tsconfig, {
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

    buildConfig.config.module = ts.ModuleKind.CommonJS;
    buildConfig.config.forceConsistentCasingInFileNames = true;
    buildConfig.config.strict = true;
    buildConfig.config.alwaysStrict = true;
    buildConfig.config.noEmit = true;
    if (buildConfig.emitDeclaration) {
        buildConfig.config.declaration = true;
    }

    if (!tsconfig.include) {
        tsconfig.include = [];
    }
    if (!tsconfig.include.includes("node_modules/@bytelab.studio/tsb-runtime/**/index.d.ts")) {
        tsconfig.include.push("node_modules/@bytelab.studio/tsb-runtime/**/index.d.ts");
    }
    if (!tsconfig.include.includes("tsb.ts")) {
        tsconfig.include.push("tsb.ts");
    }
    if (!buildConfig.config.paths) {
        buildConfig.config.paths = {};
    }
    buildConfig.config.paths.tsb = ["./node_modules/@bytelab.studio/tsb-runtime/types/index.d.ts"]

    fs.writeFileSync(path.join(process.cwd(), "tsconfig.json"), JSON.stringify({
        compilerOptions: convertCompilerOptionsToJson(buildConfig.config),
        files: buildConfig.moduleFiles.filter(f => !f.startsWith("node_modules")),
        include: tsconfig.include
    }, null, 4));

    if (buildConfig.emitDeclaration) {
        buildConfig.config.noEmit = false;
    }

    loadProgram(buildConfig);
    setProgram(buildConfig.program);

    buildConfig.program.getSourceFiles().map(s => s.fileName).forEach(file => {
        if (isMetaFile(file)) {
            return;
        }
        if (!isSourceFile(file)) {
            return;
        }
        if (!buildConfig.project.files.includes(file) && !buildConfig.platform.isFileIncluded(file)) {
            console.log(`WARNING: Loading file '${file}' which is not content of the bundle`);
        }
    });

    const allDiagnostics: readonly ts.Diagnostic[] = ts.getPreEmitDiagnostics(buildConfig.program).concat(buildConfig.program.emit(undefined, fileName => void 0).diagnostics);
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
    for (let i: number = 0; i < buildConfig.project.map.length; i++) {
        const info: FileMapEntry = buildConfig.project.map[i];
        let sourceFile: ts.SourceFile = buildConfig.program.getSourceFile(info.file)!;
        modules[i] = transformToModule(sourceFile, buildConfig, info);
    }
    emitModule(
        buildConfig,
        modules,
        path.join(process.cwd(), buildConfig.outPath),
        !!buildConfig.entryFile ? buildConfig.project.map.find(e => e.file == buildConfig.entryFile)!.hash : undefined
    );
}