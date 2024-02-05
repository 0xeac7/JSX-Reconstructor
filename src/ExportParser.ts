import {
  Program,
  VariableDeclaration,
  ExpressionStatement,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  FunctionExpression,
  Identifier,
  AssignmentExpression,
  MemberExpression,
} from "estree";
import * as recast from "recast";

import ImportParser from "./ImportParser";

class ExportParser {
  importParser: ImportParser;
  program: Program;

  constructor(importParser: ImportParser) {
    this.importParser = importParser;
    this.program = importParser.program;
  }

  isExport(node: ExpressionStatement): boolean {
    return !!(
      node.type === "ExpressionStatement" &&
      node.expression.type === "AssignmentExpression" &&
      node.expression.left.type === "MemberExpression" &&
      node.expression.left.object.type === "Identifier" &&
      node.expression.left.object.name === "exports" &&
      node.expression.right.type === "Identifier"
    );
  }

  findExportDeclaration(name: string): VariableDeclaration | null | undefined {
    return this.program.body.find(
      (node) =>
        node.type === "VariableDeclaration" &&
        node.declarations.find(
          (declarator) =>
            declarator.id.type === "Identifier" && declarator.id.name === name
        )
    )! as VariableDeclaration;
  }

  parse(node: ExpressionStatement, parent: Program): any {
    if (
      node.type === "ExpressionStatement" &&
      node.expression.type === "CallExpression" &&
      // @ts-ignore
      node.expression.callee.type === "ParenthesizedExpression" &&
      (node.expression.callee as any).expression.type ===
        "FunctionExpression" &&
      ((node.expression.callee as any).expression as FunctionExpression).params
        .length === 1 &&
      ((node.expression.callee as any).expression as FunctionExpression)
        .params[0].type === "Identifier" &&
      node.expression.arguments.length === 1 &&
      node.expression.arguments[0].type === "LogicalExpression" &&
      node.expression.arguments[0].operator === "||" &&
      // @ts-ignore
      node.expression.arguments[0].right.type === "ParenthesizedExpression" &&
      (node.expression.arguments[0].right as any).expression.type ===
        "AssignmentExpression" &&
      (
        (node.expression.arguments[0].right as any)
          .expression as AssignmentExpression
      ).left.type === "MemberExpression" &&
      (
        (
          (node.expression.arguments[0].right as any)
            .expression as AssignmentExpression
        ).left as MemberExpression
      ).object.type === "Identifier" &&
      (
        (
          (
            (node.expression.arguments[0].right as any)
              .expression as AssignmentExpression
          ).left as MemberExpression
        ).object as Identifier
      ).name === "exports" &&
      (
        (
          (node.expression.arguments[0].right as any)
            .expression as AssignmentExpression
        ).left as MemberExpression
      ).property.type === "Identifier"
    ) {
      const functionExpression = (node.expression.callee as any)
        .expression as FunctionExpression;

      const enumToDeclare = functionExpression.params[0] as Identifier;
      const exportProperty = (
        (
          (
            (node.expression.arguments[0].right as any)
              .expression as AssignmentExpression
          ).left as MemberExpression
        ).property as Identifier
      ).name;

      const realObject = {};

      for (const _node of functionExpression.body.body) {
        if (
          _node.type === "ExpressionStatement" &&
          _node.expression.type === "AssignmentExpression" &&
          _node.expression.left.type === "MemberExpression" &&
          _node.expression.left.object.type === "Identifier" &&
          _node.expression.left.object.name === enumToDeclare.name &&
          _node.expression.left.property.type === "Literal" &&
          _node.expression.left.property.value
        ) {
          // @ts-ignore
          realObject[_node.expression.left.property.value] =
            _node.expression.right;
        }
      }

      const objectExpression = {
        type: "ObjectExpression",
        properties: Object.entries(realObject).map(([key, value]) => {
          return {
            type: "Property",
            method: false,
            shorthand: false,
            computed: false,
            key: {
              type: "Identifier",
              name: key,
            },
            value,
            kind: "init",
          };
        }),
      };

      return {
        type: "ExportNamedDeclaration",
        declaration: {
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: {
                type: "Identifier",
                name: exportProperty,
              },
              init: objectExpression,
            },
          ],
          kind: "const",
        },
        specifiers: [],
      };
    }

    if (
      parent.type === "Program" &&
      node.type === "ExpressionStatement" &&
      node.expression.type === "AssignmentExpression" &&
      node.expression.left.type === "MemberExpression" &&
      node.expression.left.object.type === "Identifier" &&
      node.expression.left.object.name === "exports" &&
      node.expression.left.property.type === "Identifier"
    ) {
      if (node.expression.left.property.name === "default") {
        const decl = {
          type: "ExportDefaultDeclaration",
          declaration: node.expression.right,
        };

        for (const _node of parent.body) {
          if (_node.type === "ExportDefaultDeclaration")
            Object.assign(_node, { type: "EmptyStatement" });
        }

        return decl as any;
      } else {
        const decl = {
          type: "ExportNamedDeclaration",
          declaration: {
            type: "VariableDeclaration",
            declarations: [
              {
                type: "VariableDeclarator",
                id: node.expression.left.property,
                init: node.expression.right,
              },
            ],
            kind: "var",
          },
          specifiers: [],
        };

        for (const _node of parent.body) {
          if (recast.print(_node).code === recast.print(node).code)
            Object.assign(_node, { type: "EmptyStatement" });
        }

        return decl as any;
      }
    }

    return node;
  }
}

export default ExportParser;
