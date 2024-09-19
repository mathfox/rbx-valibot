import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue } from "../../tests";
import { any } from "./any";

describe("any", () => {
	describe("should return dataset without issues", () => {
		const schema = any();

		// Primitive types

		test("for booleans", () => {
			expectNoSchemaIssue(schema, [true, false]);
		});

		test("for numbers", () => {
			expectNoSchemaIssue(schema, [-1, 0, 123, 45.67]);
		});

		test("for undefined", () => {
			expectNoSchemaIssue(schema, [undefined]);
		});

		test("for strings", () => {
			expectNoSchemaIssue(schema, ["", "foo", "123"]);
		});

		// Complex types

		test("for arrays", () => {
			expectNoSchemaIssue(schema, [[], ["value"]]);
		});

		test("for functions", () => {
			expectNoSchemaIssue(schema, [() => {}, function () {}]);
		});

		test("for objects", () => {
			expectNoSchemaIssue(schema, [{}, { key: "value" }]);
		});
	});
});
