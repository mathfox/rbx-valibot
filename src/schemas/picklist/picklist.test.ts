import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type PicklistIssue, picklist } from "./picklist";

describe("picklist", () => {
	const options = ["foo", "bar", "baz"] as const;

	describe("should return dataset without issues", () => {
		test("for valid options", () => {
			expectNoSchemaIssue(picklist(options), ["foo", "bar", "baz"]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = picklist(options, "message");
		const baseIssue: Omit<PicklistIssue, "input" | "received"> = {
			kind: "schema",
			type: "picklist",
			expected: '("foo" | "bar" | "baz")',
			message: "message",
		};

		// Special values

		test("for empty options", () => {
			expectSchemaIssue(picklist([], "message"), { ...baseIssue, expected: "never" }, ["foo", "bar", "baz"]);
		});

		test("for invalid options", () => {
			expectSchemaIssue(schema, baseIssue, ["fo", "fooo", "foobar"]);
		});

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
			expectSchemaIssue(schema, baseIssue, ["", "hello", "123"]);
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
