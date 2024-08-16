import * as ts from "typescript";
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
    modules: [string, string][];
}

function checkDirs(outPath: string): void {
    if (!fs.existsSync(outPath) || !fs.statSync(outPath).isDirectory()) {
        throwError("Out path does not exist or is not a directory");
    }


    if (!fs.existsSync(path.join(outPath, "chunks")) || !fs.statSync(path.join(outPath, "chunks")).isDirectory()) {
        fs.mkdirSync(path.join(outPath, "chunks"));
    }
}

function chainCalls(calls: ts.CallExpression[]): ts.CallExpression {
    let chain: ts.CallExpression = calls[0];

    for (let i: number = 1; i < calls.length; i++) {
        chain = ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                chain,
                ts.factory.createIdentifier("then")
            ),
            undefined,
            [
                ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    calls[i]
                )
            ]
        )
    }

    return chain;
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


function createLoader(platform: PlatformPlugin, chunkInfos: ChunkInfo[], embeddedFileMap: boolean, entryHash?: string): ts.SourceFile {
    const statements: ts.Statement[] = [
        generateDataManager(
            platform,
            embeddedFileMap ?
                ts.factory.createArrayLiteralExpression(
                    chunkInfos.map(info =>
                        ts.factory.createArrayLiteralExpression(
                            [
                                ts.factory.createStringLiteral("."),
                                ts.factory.createStringLiteral(info.filePath),
                                ts.factory.createStringLiteral(info.hash),
                                ts.factory.createFalse(),
                                ts.factory.createArrayLiteralExpression(
                                    info.modules.map(m => ts.factory.createArrayLiteralExpression([
                                            ts.factory.createStringLiteral(m[0]),
                                            ts.factory.createStringLiteral(m[1])
                                        ])
                                    )
                                ),
                                ts.factory.createNull()
                            ]
                        ))
                ) :
                undefined
        ),
        generateAppDomain(platform),
        generateTSBModule(),
        ...platform.generateCustomLoaderProperties()
    ];

    const callChain: ts.CallExpression[] = [];

    if (!embeddedFileMap) {
        callChain.push(platform.generateInitFileMapCall());
    }

    if (entryHash) {
        callChain.push(ts.factory.createCallExpression(
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
        ));
    }

    if (callChain.length > 0) {
        statements.push(ts.factory.createExpressionStatement(
            chainCalls(callChain)
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
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2023,
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
    embeddedFileMap: boolean,
    entryHash?: string
): void {
    checkDirs(outPath);
    const chunks: ts.SourceFile[][] = chunkModules(parts, chunkSize);
    const chunkInfos: ChunkInfo[] = [];

    chunks.forEach((chunk: ts.SourceFile[], index: number): void => {
        const hash: string = fnv.hash(path.join(outPath, "chunks", "chunk" + index)).str();
        let chunkSource: ts.SourceFile = createChunk(platform, hash, chunk);
        chunkInfos.push({
            filePath: `/chunks/${hash}.js`,
            hash: hash,
            modules: project.map.filter(e => parts.map(f => f.fileName).includes(e.file)).map(e => [e.hash, e.resource])
        });

        writeSourceFile(chunkSource, path.join(outPath, "chunks"), hash, transformPlugins);
    });

    writeSourceFile(createLoader(platform, chunkInfos, embeddedFileMap, entryHash), outPath, moduleName, transformPlugins);

    if (!embeddedFileMap) {
        fs.writeFileSync(path.join(outPath, "fm.json"), JSON.stringify(chunkInfos.map(i => [null, i.filePath, i.hash, false, i.modules, null])));
    }
}