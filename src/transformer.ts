import * as ts from "typescript";
import {FileMapEntry, Project} from "./loader";
import * as path from "path";
import {PlatformPlugin, TransformPlugin} from "./plugin";

export function transformToModule(sourceFile: ts.SourceFile, info: FileMapEntry, project: Project, platform: PlatformPlugin, transformPlugins: TransformPlugin[]): ts.SourceFile {
    transformPlugins.forEach(plugin => sourceFile = plugin.transformSourceFile(sourceFile));
    const module: ts.ExpressionStatement = ts.factory.createExpressionStatement(
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("module"),
                ts.factory.createIdentifier("define"),
            ),
            undefined,
            [
                ts.factory.createStringLiteral(info.hash, false),
                ts.factory.createArrowFunction(
                    [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("__exports__"),
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                            undefined
                        ),
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("AppDomain"),
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                            undefined
                        )
                    ],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createBlock(sourceFile.statements.map(s => transformMember(sourceFile, info, project, platform.transformMember(s))).flat(), true)
                )
            ]
        )
    );
    return ts.factory.updateSourceFile(sourceFile, ts.factory.createNodeArray([module]));
}

function transformMember(sourceFile: ts.SourceFile, info: FileMapEntry, project: Project, statement: ts.Statement): ts.Statement[] {
    switch (statement.kind) {
        case ts.SyntaxKind.ImportDeclaration:
            const imp: ts.ImportDeclaration = statement as ts.ImportDeclaration;
            if (imp.importClause && imp.importClause.namedBindings && imp.importClause.namedBindings.kind == ts.SyntaxKind.NamedImports) {
                return [
                    ts.factory.createVariableStatement(undefined, [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createObjectBindingPattern(imp.importClause.namedBindings.elements.map(e =>
                                ts.factory.createBindingElement(
                                    undefined,
                                    undefined,
                                    e.name,
                                    undefined
                                )
                            )),
                            undefined,
                            undefined,
                            createImportCall(sourceFile.fileName, info.resource, project, imp.moduleSpecifier as ts.StringLiteral)
                        )
                    ])
                ];
            }
            if (imp.importClause && imp.importClause.namedBindings && imp.importClause.namedBindings.kind == ts.SyntaxKind.NamespaceImport) {
                return [
                    ts.factory.createVariableStatement(undefined, [
                            ts.factory.createVariableDeclaration(
                                imp.importClause.namedBindings.name,
                                undefined,
                                undefined,
                                createImportCall(sourceFile.fileName, info.resource, project, imp.moduleSpecifier as ts.StringLiteral)
                            )
                        ]
                    )
                ];
            }
            if (imp.importClause && imp.importClause.name) {
                return [
                    ts.factory.createVariableStatement(undefined, [
                            ts.factory.createVariableDeclaration(
                                imp.importClause.name,
                                undefined,
                                undefined,
                                ts.factory.createPropertyAccessExpression(
                                    createImportCall(sourceFile.fileName, info.resource, project, imp.moduleSpecifier as ts.StringLiteral),
                                    ts.factory.createIdentifier("default")
                                )
                            )
                        ]
                    )
                ];
            }
            if (!imp.importClause && imp.moduleSpecifier) {
                return [ts.factory.createExpressionStatement(
                    createImportCall(sourceFile.fileName, info.resource, project, imp.moduleSpecifier as ts.StringLiteral)
                )];
            }
            return [];
        case ts.SyntaxKind.EnumDeclaration:
            const e: ts.EnumDeclaration = statement as ts.EnumDeclaration;
            if (e.modifiers && e.modifiers.map(m => m.kind).includes(ts.SyntaxKind.ExportKeyword)) {
                let isDefault: boolean = e.modifiers.map(m => m.kind).includes(ts.SyntaxKind.DefaultKeyword);
                // @ts-ignore
                e.modifiers! = e.modifiers!.filter(m => m.kind != ts.SyntaxKind.ExportKeyword && m.kind != ts.SyntaxKind.DefaultKeyword);
                return [e, createExportMember(e.name!, isDefault)];
            }
            break;
        case ts.SyntaxKind.ClassDeclaration:
            const cls: ts.ClassDeclaration = statement as ts.ClassDeclaration;
            if (cls.modifiers && cls.modifiers.map(m => m.kind).includes(ts.SyntaxKind.ExportKeyword)) {
                let isDefault: boolean = cls.modifiers.map(m => m.kind).includes(ts.SyntaxKind.DefaultKeyword);
                // @ts-ignore
                cls.modifiers! = cls.modifiers!.filter(m => m.kind != ts.SyntaxKind.ExportKeyword && m.kind != ts.SyntaxKind.DefaultKeyword);
                return [cls, createExportMember(cls.name!, isDefault)];
            }
            break;
        case ts.SyntaxKind.FunctionDeclaration:
            const func: ts.FunctionDeclaration = statement as ts.FunctionDeclaration;
            if (func.modifiers && func.modifiers.map(m => m.kind).includes(ts.SyntaxKind.ExportKeyword)) {
                let isDefault: boolean = func.modifiers.map(m => m.kind).includes(ts.SyntaxKind.DefaultKeyword);
                // @ts-ignore
                func.modifiers! = func.modifiers!.filter(m => m.kind != ts.SyntaxKind.ExportKeyword && m.kind != ts.SyntaxKind.DefaultKeyword);
                return [func, createExportMember(func.name!, isDefault)];
            }
            break;
        case ts.SyntaxKind.VariableStatement:
            const variable: ts.VariableStatement = statement as ts.VariableStatement;
            if (variable.modifiers && variable.modifiers.map(m => m.kind).includes(ts.SyntaxKind.ExportKeyword)) {
                let isDefault: boolean = variable.modifiers.map(m => m.kind).includes(ts.SyntaxKind.DefaultKeyword);
                // @ts-ignore
                variable.modifiers! = variable.modifiers!.filter(m => m.kind != ts.SyntaxKind.ExportKeyword && m.kind != ts.SyntaxKind.DefaultKeyword);
                return [variable, ...variable.declarationList.declarations.map(dec => createExportMember(dec.name as ts.Identifier, isDefault))];
            }
            break;
        case ts.SyntaxKind.ExportDeclaration:
            const exp: ts.ExportDeclaration = statement as ts.ExportDeclaration;
            if (exp.exportClause && exp.exportClause.kind == ts.SyntaxKind.NamedExports && !exp.moduleSpecifier) {
                return exp.exportClause.elements.map(e => createExportMember(e.name));
            }
            if (!exp.exportClause && exp.moduleSpecifier) {
                return [ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("Object"),
                            ts.factory.createIdentifier("assign"),
                        ),
                        undefined,
                        [
                            ts.factory.createIdentifier("__exports__"),
                            createImportCall(sourceFile.fileName, info.resource, project, exp.moduleSpecifier as ts.StringLiteral)
                        ]
                    )
                )];
            }
            if (exp.exportClause && exp.exportClause.kind == ts.SyntaxKind.NamedExports && exp.moduleSpecifier) {
                const tmp: string = "tmp_" + exp.pos;
                return [
                    ts.factory.createVariableStatement(
                        undefined,
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(tmp),
                                undefined,
                                undefined,
                                createImportCall(sourceFile.fileName, info.resource, project, exp.moduleSpecifier as ts.StringLiteral)
                            )
                        ]
                    ),
                    ...exp.exportClause.elements.map(e => ts.factory.createExpressionStatement(
                        ts.factory.createAssignment(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("__exports__"),
                                e.name
                            ),
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(tmp),
                                e.name
                            )
                        )
                    ))
                ];
            }
            return [];
    }
    return [statement];
}

function createExportMember(identifier: ts.Identifier, isDefault: boolean = false): ts.ExpressionStatement {
    return ts.factory.createExpressionStatement(
        ts.factory.createAssignment(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("__exports__"),
                isDefault
                    ? ts.factory.createIdentifier("default")
                    : identifier
            ),
            identifier
        )
    );
}

function createImportCall(from: string, modulePath: string, project: Project, module: ts.StringLiteral): ts.AwaitExpression {
    let hash: string;
    if (module.text.startsWith(".")) {
        const targetModule: string = path.join(path.dirname(modulePath), module.text).replace(/\\/g, "/").replace("res:", "res://") + ".ts";
        hash = project.map.find(e => e.resource == targetModule)!.hash

        if (!hash) {
            throw "Unknown hash";
        }
    } else {
        hash = "node:" + module.text;
    }

    return ts.factory.createAwaitExpression(
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("AppDomain"),
                ts.factory.createIdentifier("resolve")
            ),
            undefined,
            [
                ts.factory.createStringLiteral(hash)
            ]
        )
    );
}