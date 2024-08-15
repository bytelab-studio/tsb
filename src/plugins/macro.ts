import {TransformPlugin} from "../plugin";
import * as ts from "typescript";
import {privateDecrypt} from "node:crypto";
import {ArrowFunction, SourceFile} from "typescript";

// export type NonNullableNonVoid<T> = NonNullable<T> extends void ? never : NonNullable<T>;
// export type ExpressionMacro<TRet> = (...args: any[]) => NonNullableNonVoid<TRet>;
// export type StatementMacro = (...args: any[]) => any;

class Macro extends TransformPlugin {
    private static maxMacroDepth: number = 100;

    public get flagName(): string {
        return "macro";
    }

    public get flagDescription(): string {
        return "Search for macro definitions and replaces them";
    }

    public transformSourceFile(sourceFile: ts.SourceFile): ts.SourceFile {
        const checker: ts.TypeChecker = this.program.getTypeChecker();
        let foundMacroCounter: number = 1; // For first iteration

        const visitor: ts.Visitor = <T extends ts.Node>(node: T): T | T[] => {
            if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
                const validMacro = this.isValidMacro(sourceFile, node, checker)

                if (!validMacro) {
                    return node;
                }
                const [type, initializer] = validMacro;

                if (type == "ExpressionMacro") {
                    foundMacroCounter++;
                    return this.replaceExpressionMacro(initializer, node, checker) as T;
                }

                let {line, character} = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
                console.log(`WARNING: Found a statement macro call in '${sourceFile.fileName} (${line + 1},${character + 1})' which is used in a expression context`);
                return node;
            }
            if (ts.isExpressionStatement(node)) {
                if (ts.isCallExpression(node.expression) && ts.isIdentifier(node.expression.expression)) {
                    const validMacro: false | [string, ArrowFunction] = this.isValidMacro(sourceFile, node.expression, checker)

                    if (!validMacro) {
                        return node;
                    }
                    const [type, initializer] = validMacro;

                    if (type == "StatementMacro") {
                        foundMacroCounter++;
                        return this.replaceStatementMacro(initializer, node.expression, checker) as unknown as T[];
                    }

                    let {line, character} = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
                    console.log(`WARNING: Found a expression macro call in '${sourceFile.fileName} (${line + 1},${character + 1})' which is used in a statement context`);
                    return node;
                }
            }

            return ts.visitEachChild(node, visitor, undefined);
        }

        let i: number = 0;
        for (; i < Macro.maxMacroDepth && foundMacroCounter != 0; i++) {
            foundMacroCounter = 0;
            sourceFile = ts.visitNode(sourceFile, visitor) as SourceFile;
        }
        if (Macro.maxMacroDepth >= i && foundMacroCounter != 0) {
            console.log(`WARNING: Macro expansion is exceeding the maximum in '${sourceFile.fileName}'. Did you got a macro loop?`);
        }
        return sourceFile;
    }

    private isValidMacro(sourceFile: ts.SourceFile, node: ts.CallExpression, checker: ts.TypeChecker): false | [string, ArrowFunction] {
        const symbol: ts.Symbol = checker.getSymbolAtLocation(node.expression)!;
        if (!symbol.valueDeclaration || !ts.isVariableDeclaration(symbol.valueDeclaration)) {
            return false;
        }
        const declaration: ts.VariableDeclaration = symbol.valueDeclaration;
        if (!declaration.type || !ts.isTypeReferenceNode(declaration.type) || !ts.isIdentifier(declaration.type.typeName)) {
            return false;
        }
        if ((declaration.type.typeName.text == "ExpressionMacro" || declaration.type.typeName.text == "StatementMacro") && (declaration.parent.flags & ts.NodeFlags.Const) == 0) {
            let {
                line,
                character
            } = ts.getLineAndCharacterOfPosition(declaration.getSourceFile(), declaration.getStart());
            console.log(`WARNING: Found a macro in '${declaration.getSourceFile().fileName} (${line + 1},${character + 1})' which is ignored because it is not declared as 'const'`);
            return false;
        }
        if (!declaration.initializer || !ts.isArrowFunction(declaration.initializer)) {
            let {line, character} = ts.getLineAndCharacterOfPosition(sourceFile, declaration.getStart());
            console.log(`WARNING: Found a macro in '${declaration.getSourceFile().fileName} (${line + 1},${character + 1})' which has a incorrect initializer`);
            return false;
        }
        const initializer: ts.ArrowFunction = declaration.initializer;
        if (declaration.type.typeName.text == "ExpressionMacro" && ts.isBlock(initializer.body)) {
            let {
                line,
                character
            } = ts.getLineAndCharacterOfPosition(declaration.getSourceFile(), declaration.getStart());
            console.log(`WARNING: Found a macro in '${declaration.getSourceFile().fileName} (${line + 1},${character + 1})' which has a incorrect initializer. Expression macros cannot have a block body`);
            return false;
        }
        if (declaration.type.typeName.text == "StatementMacro" && !ts.isBlock(initializer.body)) {
            let {
                line,
                character
            } = ts.getLineAndCharacterOfPosition(declaration.getSourceFile(), declaration.getStart());
            console.log(`WARNING: Found a macro in '${declaration.getSourceFile().fileName} (${line + 1},${character + 1})' which has a incorrect initializer. Statement macros must have a block body`);
            return false;
        }

        return [declaration.type.typeName.text, initializer];
    }

    private replaceExpressionMacro(macro: ts.ArrowFunction, callee: ts.CallExpression, checker: ts.TypeChecker): ts.Node {
        return ts.factory.createParenthesizedExpression(this.replaceArguments(macro, callee, checker));
    }

    private replaceStatementMacro(macro: ts.ArrowFunction, callee: ts.CallExpression, checker: ts.TypeChecker): ts.NodeArray<ts.Statement> {
        const body: ts.Block = this.replaceArguments(macro, callee, checker);
        return body.statements;
    }

    private replaceArguments<T extends ts.Expression | ts.Block>(macro: ts.ArrowFunction, callee: ts.CallExpression, checker: ts.TypeChecker): T {
        const visitor: ts.Visitor = <T extends ts.Node>(node: T): T => {
            if (ts.isIdentifier(node)) {
                const symbol = checker.getSymbolAtLocation(node);
                if (!symbol || !symbol.valueDeclaration) {
                    return node;
                }
                const index: number = macro.parameters.findIndex(p => p == symbol.valueDeclaration);
                if (index >= 0) {
                    return callee.arguments[index] as unknown as T;
                }
                return node;
            }

            return ts.visitEachChild(node, visitor, undefined);
        }

        return ts.visitNode(macro.body, visitor) as T;
    }

    static {
        TransformPlugin.registerPlugin(new Macro());
    }
}


