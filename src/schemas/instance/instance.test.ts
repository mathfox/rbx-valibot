import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type InstanceIssue, instance } from "./instance";

describe("instance", () => {
	describe("should return dataset without issues", () => {
		const schema = instance(Promise);

		test("for valid instances", () => {
			expectNoSchemaIssue(schema, [new Promise(() => {})]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = instance(Promise, "message");
		const baseIssue: Omit<InstanceIssue, "input" | "received"> = {
			kind: "schema",
			type: "instance",
			expected: expect.stringContaining("table:"),
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
