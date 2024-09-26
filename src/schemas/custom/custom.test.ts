import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { custom } from "./custom";
import type { CustomIssue } from "./types";

describe("custom", () => {
	const isEven = (input: unknown) => typeIs(input, "number") && input % 2 === 0;

	describe("should return dataset without issues", () => {
		const schema = custom(isEven);

		test("for numbers", () => {
			expectNoSchemaIssue(schema, [2, 4, 10, 22]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = custom(isEven, "message");

		const baseIssue: Omit<CustomIssue, "input" | "received"> = {
			kind: "schema",
			type: "custom",
			expected: "unknown",
			message: "message",
		};

		// Primitive types

		test("for booleans", () => {
			expectSchemaIssue(schema, baseIssue, [true, false]);
		});

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 1, 123, 45.67]);
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
