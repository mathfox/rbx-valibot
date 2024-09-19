import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type PromiseIssue, promise } from "./promise";

describe("promise", () => {
	describe("should return dataset without issues", () => {
		const schema = promise();

		test("for Promise objects", () => {
			expectNoSchemaIssue(schema, [Promise.resolve(), Promise.resolve("foo"), Promise.all([])]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = promise("message");
		const baseIssue: Omit<PromiseIssue, "input" | "received"> = {
			kind: "schema",
			type: "promise",
			expected: "Promise",
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
