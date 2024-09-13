import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../vitest/index.ts";
import { type SymbolIssue, type SymbolSchema, symbol } from "./symbol.ts";

describe("symbol", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<SymbolSchema<never>, "message"> = {
			kind: "schema",
			type: "symbol",
			reference: symbol,
			expects: "symbol",
			async: false,
			_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const schema: SymbolSchema<undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(symbol()).toStrictEqual(schema);
			expect(symbol(undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(symbol("message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies SymbolSchema<"message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(symbol(message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies SymbolSchema<typeof message>);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = symbol("message");
		const baseIssue: Omit<SymbolIssue, "input" | "received"> = {
			kind: "schema",
			type: "symbol",
			expected: "symbol",
			message: "message",
		};

		// Primitive types

		test("for booleans", () => {
			expectSchemaIssue(schema, baseIssue, [true, false]);
		});

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for undefined", () => {
			expectSchemaIssue(schema, baseIssue, [undefined]);
		});

		test("for strings", () => {
			expectSchemaIssue(schema, baseIssue, ["", "foo", "123"]);
		});

		// Complex types

		test("for arrays", () => {
			expectSchemaIssue(schema, baseIssue, [[], ["value"]]);
		});

		test("for functions", () => {
			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
		});

		test("for objects", () => {
			expectSchemaIssue(schema, baseIssue, [{}, { key: "value" }]);
		});
	});
});
