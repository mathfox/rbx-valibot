import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type BooleanIssue, boolean } from "./boolean";

describe("boolean", () => {
	describe("should return dataset without issues", () => {
		const schema = boolean();

		test("for true boolean", () => {
			expectNoSchemaIssue(schema, [true]);
		});

		test("for false boolean", () => {
			expectNoSchemaIssue(schema, [false]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = boolean("message");
		const baseIssue: Omit<BooleanIssue, "input" | "received"> = {
			kind: "schema",
			type: "boolean",
			expected: "boolean",
			message: "message",
		};

		// Primitive types

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for undefined", () => {
			expectSchemaIssue(schema, baseIssue, [undefined]);
		});

		test("for strings", () => {
			expectSchemaIssue(schema, baseIssue, ["", "0", "true", "false"]);
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
