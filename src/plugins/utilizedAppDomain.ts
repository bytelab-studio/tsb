import {ClassElement} from "typescript";
import {AppDomainPlugin} from "../plugin";
import * as ts from "typescript";

class UtilizedAppDomain extends AppDomainPlugin {
    public fields(): ClassElement[] {
        return [
            ts.factory.createMethodDeclaration(
                [ts.factory.createToken(ts.SyntaxKind.PublicKeyword)],
                undefined,
                "isPrimaryDomain",
                undefined,
                undefined,
                [],
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                ts.factory.createBlock([
                    ts.factory.createReturnStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("AppDomain"),
                                ts.factory.createIdentifier("primaryDomain")
                            ),
                            ts.SyntaxKind.EqualsEqualsToken,
                            ts.factory.createThis()
                        )
                    )
                ])
            ),
            ts.factory.createMethodDeclaration(
                [ts.factory.createToken(ts.SyntaxKind.PublicKeyword)],
                undefined,
                "createDomain",
                undefined,
                undefined,
                [],
                ts.factory.createTypeReferenceNode(
                    "AppDomain"
                ),
                ts.factory.createBlock([
                    ts.factory.createReturnStatement(
                        ts.factory.createNewExpression(
                            ts.factory.createIdentifier("AppDomain"),
                            undefined,
                            []
                        )
                    )
                ])
            )
        ]
    }


    static {
        AppDomainPlugin.registerPlugin(new UtilizedAppDomain());
    }
}