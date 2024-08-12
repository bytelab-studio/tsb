import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import {OptionFlagArgument, OptionSet} from "@koschel-christoph/node.options";
import {FileMapEntry, loadDir, loadFiles, loadProgram, Project} from "../loader";
import {transformToModule} from "../transformer";
import {emitModule} from "../emit";
import {throwError} from "../error";
import {Platform} from "../platform";
import {PlatformPlugin, TransformPlugin} from "../plugin";
import {loadBuilderScript} from "../builder";

import "../plugins";

export default function build(args: string[]): void {
    let moduleName: string = "app";
    const moduleFiles: string[] = [];
    let platformName: string | undefined;
    let requestHelp: boolean = false;
    let entryFile: string | undefined;
    let outPath: string = "out";
    let chunkSize: number = 10_000;
    let useBuilder: boolean = false;
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
        entryFile = path.posix.join(process.cwd(), entryFile);
    }

    moduleFiles.push(...loadDir(path.join("node_modules", "@bytelab.studio", "tsb-runtime"), false));

    const platform: PlatformPlugin = (Platform as any)[platformName] as PlatformPlugin;
    moduleFiles.push(...platform.resolveFiles().map(p => p.replace(/\\/g, "/")));


    const project: Project = loadFiles(moduleFiles, moduleName);
    platform.setData(project);

    if (entryFile && !project.map.find(e => e.file == entryFile)) {
        throwError("Entry file is not included in the bundle");
    }

    fs.writeFileSync(path.join(process.cwd(), "tsconfig.json"), JSON.stringify({
        compilerOptions: {
            target: "ES2023",
            module: "commonjs",
            forceConsistentCasingInFileNames: true,
            strict: true,
            alwaysStrict: true,
            noResolve: true
        },
        files: moduleFiles.filter(f => !f.startsWith("node_modules")),
        include: [
            "node_modules/**/*"
        ]
    }, null, 4));

    const program: ts.Program = loadProgram(project, {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2023,
        esModuleInterop: true,
        alwaysStrict: true,
        noResolve: true
    });

    const allDiagnostics: readonly ts.Diagnostic[] = ts.getPreEmitDiagnostics(program).concat(program.emit(undefined, fileName => 0).diagnostics);
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
        path.join(process.cwd(), outPath),
        moduleName,
        chunkSize,
        !!entryFile ? project.map.find(e => e.file == entryFile)!.hash : undefined
    );
}