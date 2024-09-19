import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type StringIssue, string_ } from "./string";

describe("string", () => {
	describe("should return dataset without issues", () => {
		const schema = string_();

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
		const schema = string_("message");
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
