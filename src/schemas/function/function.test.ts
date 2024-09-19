import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type FunctionIssue, function_ } from "./function";

describe("function", () => {
	describe("should return dataset without issues", () => {
		const schema = function_();

		test("for functions", () => {
			expectNoSchemaIssue(schema, [() => {}, function () {}]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = function_("message");
		const baseIssue: Omit<FunctionIssue, "input" | "received"> = {
			kind: "schema",
			type: "function",
			expected: "Function",
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

		test("for objects", () => {
			expectSchemaIssue(schema, baseIssue, [{}, { key: "value" }]);
		});
	});
});
