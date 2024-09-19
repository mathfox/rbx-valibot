import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type UndefinedIssue, type UndefinedSchema, undefined_ } from "./undefined";

describe("undefined", () => {
	describe("should return dataset without issues", () => {
		const schema = undefined_();

		test("for undefined", () => {
			expectNoSchemaIssue(schema, [undefined]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = undefined_("message");
		const baseIssue: Omit<UndefinedIssue, "input" | "received"> = {
			kind: "schema",
			type: "undefined",
			expected: "undefined",
			message: "message",
		};

		// Primitive types

		test("for booleans", () => {
			expectSchemaIssue(schema, baseIssue, [true, false]);
		});

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
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
