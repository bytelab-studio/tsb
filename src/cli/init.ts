import * as fs from "fs";
import * as child_process from "child_process";
import * as path from "node:path";
import {PackageJsonInfoCache} from "typescript";

function makeDir(dir: string): void {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        return;
    }

    fs.mkdirSync(dir);
}

function writeFile(file: string, content: string, force: boolean = false): void {
    if (force && fs.existsSync(file) && fs.statSync(file).isFile()) {
        return;
    }

    fs.writeFileSync(file, content);
}

export default function init(args: string[]): void {
    const packageJSON: {
        version: `${number}.${number}.${number}`
    } = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8"));
    console.log("> Check folder structure");
    makeDir(path.join(process.cwd(), "src"));
    makeDir(path.join(process.cwd(), "out"));

    console.log("> Init npm");
    child_process.execSync("npm init -y", {
        cwd: process.cwd()
    });

    console.log("> Install required dependencies");
    console.log(`> > Install @bytelab.studio/tsb-runtime@^${packageJSON.version.split(".")[0]}`);
    child_process.execSync(`npm install --include=dev @bytelab.studio/tsb-runtime@^${packageJSON.version.split(".")[0]}`, {
        cwd: process.cwd()
    });

    console.log("> Create config file");
    writeFile("tsb.js", "const {builder} = require(\"tsb\");\n\nbuilder\n    .module(\"my-module\")\n    .addFolders(\"./src\")\n    .output(\"./out\")\n    .platform(\"nodejs\")");

}