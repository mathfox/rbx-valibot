import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type StringIssue, type StringSchema, string } from "./string";

describe("string", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<StringSchema<never>, "message"> = {
			kind: "schema",
			type: "string",
			reference: string,
			expects: "string",
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: StringSchema<undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(string()).toStrictEqual(schema);
			expect(string(undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(string("message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies StringSchema<"message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(string(message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies StringSchema<typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = string();

		test("for empty strings", () => {
			expectNoSchemaIssue(schema, ["", " ", "\n"]);
		});

		test("for single char", () => {
			expectNoSchemaIssue(schema, ["a", "A", "0"]);
		});

		test("for multiple chars", () => {
			expectNoSchemaIssue(schema, ["abc", "ABC", "123"]);
		});

		test("for special chars", () => {
			expectNoSchemaIssue(schema, ["-", "+", "#", "$", "%"]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = string("message");
		const baseIssue: Omit<StringIssue, "input" | "received"> = {
			kind: "schema",
			type: "string",
			expected: "string",
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
