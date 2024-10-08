import * as fs from "fs";
import * as path from "path";
import {throwError} from "./error";
import * as vm from "vm";
import * as ts from "typescript";
import {ModuleKind} from "typescript";

export function loadBuilderScript(): string[] {
    const tsbPath: string = path.join(process.cwd(), "tsb.ts");

    if (!fs.existsSync(tsbPath) || !fs.statSync(tsbPath).isFile()) {
        throwError(`File '${tsbPath}' does not exist or is not a file`);
    }
    const builder: Builder = new Builder();

    const context: vm.Context = vm.createContext({
        exports: {},
        require: (module: string) => {
            if (module == "tsb") {
                return {
                    builder: builder
                }
            }

            throw "Only the module 'tsb' can be used in the config file";
        }
    });
    try {
        const diagnostics: ts.Diagnostic[] = [];
        const code: string = ts.transpile(fs.readFileSync(tsbPath, "utf8"), {
            module: ModuleKind.CommonJS
        }, tsbPath, diagnostics);

        if (diagnostics.length != 0) {
            diagnostics.forEach(diagnostic => {
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

        const script: vm.Script = new vm.Script(code);
        script.runInContext(context);

        return builder.toArgs();
    } catch (e) {
        throwError(`A error was produced in '${tsbPath}'\n${e}`);
    }
}

type TSBPlatform = "nodejs" | "browser" | string;

class Builder {
    private moduleValue: string = "app";
    private platformValue: string | undefined;
    private entryValue: string | undefined;
    private outputValue: string = "out";
    private filesValue: string[] = [];
    private chunkSizeValue: number | undefined;
    private embeddedFileMapValue: boolean = false;
    private pluginsValue: string[] = [];

    public module(name: string): this {
        this.moduleValue = name;
        return this;
    }

    public platform(platform: TSBPlatform): this {
        this.platformValue = platform;
        return this;
    }

    public entry(file: string): this {
        this.entryValue = file;
        return this;
    }

    public output(folder: string): this {
        this.outputValue = folder;
        return this;
    }

    public addFiles(...files: string[]): this {
        this.filesValue.push(...files);
        return this;
    }

    public addFolders(...folders: string[]): this {
        folders.forEach(folder => {
            if (fs.existsSync(folder) && !fs.statSync(folder).isDirectory()) {
                throw "Directory does not exist or is not a directory";
            }

            function __loader__(dir: string): string[] {
                const res: string[] = [];
                fs.readdirSync(dir).forEach(item => {
                    item = path.posix.join(dir, item);
                    if (fs.statSync(item).isDirectory()) {
                        res.push(...__loader__(item));
                    } else if (item.endsWith(".ts") && !item.endsWith(".d.ts")) {
                        res.push(item);
                    }
                });
                return res;
            }

            this.filesValue.push(...__loader__(folder));
        });
        return this;
    }

    public chunkSize(size: number): this {
        this.chunkSizeValue = size;
        return this;
    }

    public embeddedFileMap(f: boolean): this {
        this.embeddedFileMapValue = f;
        return this;
    }

    public plugins(...names: string[]): this {
        this.pluginsValue.push(...names);
        return this;
    }

    public toArgs(): string[] {
        const args: string[] = [];
        args.push("-m", this.moduleValue);
        if (this.platformValue) {
            args.push("-p", this.platformValue)
        }
        if (this.entryValue) {
            args.push("-e", this.entryValue)
        }
        args.push("-o", this.outputValue);
        args.push(...this.filesValue);
        if (this.chunkSizeValue) {
            args.push("--chunk-size", this.chunkSizeValue.toString());
        }
        if (this.embeddedFileMapValue) {
            args.push("--embedded-file-map");
        }
        args.push(...this.pluginsValue.map(p => "--plugin-" + p));

        return args;
    }
}