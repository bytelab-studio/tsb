import * as ts from "typescript";
import {factory, ModuleKind, ScriptTarget} from "typescript";
import * as fs from "fs";
import * as path from "path";
import * as fnv from "fnv-plus";
import {generateAppDomain, generateDataManager, generateModuleConstructor, generateTSBModule} from "./template";
import {Project} from "./loader";
import {PlatformPlugin, TransformPlugin} from "./plugin";
import {throwError} from "./error";

export interface ChunkInfo {
    filePath: string;
    hash: string;
    modules: string[];
}

function checkDirs(outPath: string): void {
    if (!fs.existsSync(outPath) || !fs.statSync(outPath).isDirectory()) {
        throwError("Out path does not exist or is not a directory");
    }


    if (!fs.existsSync(path.join(outPath, "chunks")) || !fs.statSync(path.join(outPath, "chunks")).isDirectory()) {
        fs.mkdirSync(path.join(outPath, "chunks"));
    }
}

function createChunk(platform: PlatformPlugin, hash: string, parts: ts.SourceFile[]): ts.SourceFile {
    return ts.factory.updateSourceFile(parts[0], [
        ts.factory.createBlock(
            [
                ...platform.generateModuleHeader(),
                generateModuleConstructor(hash),
                ...platform.generateModuleAfterLoad(),
                ...parts.map(part => part.statements.map(s => s)).flat()
            ]
        )
    ]);
}

function chunkModules(modules: ts.SourceFile[], chunkSize: number): ts.SourceFile[][] {
    const result: ts.SourceFile[][] = [];
    let currentChunk: ts.SourceFile[] = [];
    let currentLength = 0;
    const printer = ts.createPrinter();

    for (let i = 0; i < modules.length; i++) {
        const module: ts.SourceFile = modules[i];
        const moduleLength: number = printer.printFile(module).length;
        const isLastModule: boolean = i == modules.length - 1;

        if (!isLastModule && currentLength + moduleLength > chunkSize) {
            result.push(currentChunk);
            currentChunk = [module];
            currentLength = moduleLength;
        } else {
            currentChunk.push(module);
            currentLength += moduleLength;
        }
    }

    if (currentChunk.length > 0) {
        result.push(currentChunk);
    }

    return result;
}


function createLoader(platform: PlatformPlugin, chunkInfos: ChunkInfo[], entryHash?: string): ts.SourceFile {
    const statements: ts.Statement[] = [
        generateDataManager(
            platform,
            ts.factory.createArrayLiteralExpression(
                chunkInfos.map(info =>
                    ts.factory.createObjectLiteralExpression(
                        [
                            factory.createPropertyAssignment("filePath", ts.factory.createStringLiteral(info.filePath)),
                            factory.createPropertyAssignment("hash", ts.factory.createStringLiteral(info.hash)),
                            factory.createPropertyAssignment("loaded", ts.factory.createFalse()),
                            factory.createPropertyAssignment(
                                "modules",
                                ts.factory.createArrayLiteralExpression(
                                    info.modules.map(module => ts.factory.createStringLiteral(module))
                                )
                            ),
                            factory.createPropertyAssignment("holder", ts.factory.createNull())
                        ]
                    )
                )
            )
        ),
        generateAppDomain(platform),
        generateTSBModule(),
        ...platform.generateCustomLoaderProperties()
    ];

    if (entryHash) {
        statements.push(ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("AppDomain"),
                        ts.factory.createIdentifier("primaryDomain")
                    ),
                    ts.factory.createIdentifier("resolve")
                ),
                undefined,
                [
                    ts.factory.createStringLiteral(entryHash)
                ]
            )
        ));
    }

    return ts.factory.createSourceFile(statements,
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        0
    );

}

function writeSourceFile(file: ts.SourceFile, outPath: string, name: string, transformPlugins: TransformPlugin[]): void {
    const printer: ts.Printer = ts.createPrinter({
        removeComments: true
    });
    const code: string = printer.printFile(file);
    let result: string = ts.transpile(code, {
        module: ModuleKind.CommonJS,
        target: ScriptTarget.ES2023,
        esModuleInterop: true,
        alwaysStrict: true
    });
    transformPlugins.forEach(plugin => result = plugin.transformJavaScript(result));
    fs.writeFileSync(path.join(outPath, name + ".js"), result);
}

export function emitModule(
    project: Project,
    parts: ts.SourceFile[],
    platform: PlatformPlugin,
    transformPlugins: TransformPlugin[],
    outPath: string,
    moduleName: string,
    chunkSize: number,
    entryHash?: string
): void {
    checkDirs(outPath);
    const chunks: ts.SourceFile[][] = chunkModules(parts, chunkSize);
    const chunkInfos: ChunkInfo[] = [];

    chunks.forEach((chunk: ts.SourceFile[], index: number): void => {
        const hash: string = fnv.hash(path.join(outPath, "chunks", "chunk" + index)).str();
        let chunkSource: ts.SourceFile = createChunk(platform, hash, chunk);
        chunkInfos.push({
            filePath: `./chunks/${hash}.js`,
            hash: hash,
            modules: project.map.filter(e => parts.map(f => f.fileName).includes(e.file)).map(e => e.hash)
        });

        writeSourceFile(chunkSource, path.join(outPath, "chunks"), hash, transformPlugins);
    });
    writeSourceFile(createLoader(platform, chunkInfos, entryHash), outPath, moduleName, transformPlugins);
}