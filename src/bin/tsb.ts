#!/usr/bin/env node
import init from "../cli/init";
import build from "../cli/build";

const args: string[] = process.argv;

args.shift()
args.shift()
const command: string | undefined = args.shift();

if (!command) {
    console.log("Commands: init, build");
    process.exit(1);
}

if (command == "init") {
    init(args);
} else if (command == "build") {
    build(args);
}