import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue } from "../../vitest/index.ts";
import { type UnknownSchema, unknown } from "./unknown.ts";

describe("unknown", () => {
	test("should return schema object", () => {
		expect(unknown()).toStrictEqual({
			kind: "schema",
			type: "unknown",
			reference: unknown,
			expects: "unknown",
			async: false,
			_run: expect.any(Function),
		} satisfies UnknownSchema);
	});

	describe("should return dataset without issues", () => {
		const schema = unknown();

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
