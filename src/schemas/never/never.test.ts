import { describe, test } from "@rbxts/jest-globals";
import { expectSchemaIssue } from "../../tests";
import { type NeverIssue, never } from "./never";

describe("never", () => {
	describe("should return dataset with issues", () => {
		const schema = never("message");
		const baseIssue: Omit<NeverIssue, "input" | "received"> = {
			kind: "schema",
			type: "never",
			expected: "never",
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
			expectSchemaIssue(schema, baseIssue, ["", "0", "-2", "12.34"]);
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
