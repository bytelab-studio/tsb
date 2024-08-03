export function throwError(err: string): never {
    console.log(err);
    process.exit(1);
}