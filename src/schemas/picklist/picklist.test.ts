import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../vitest";
import { type PicklistIssue, type PicklistSchema, picklist } from "./picklist";

describe("picklist", () => {
	const options = ["foo", "bar", "baz"] as const;
	type Options = typeof options;

	describe("should return schema object", () => {
		const baseSchema: Omit<PicklistSchema<Options, never>, "message"> = {
			kind: "schema",
			type: "picklist",
			reference: picklist,
			expects: '("foo" | "bar" | "baz")',
			options,
			async: false,
			_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const schema: PicklistSchema<Options, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(picklist(options)).toStrictEqual(schema);
			expect(picklist(options, undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(picklist(options, "message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies PicklistSchema<Options, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(picklist(options, message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies PicklistSchema<Options, typeof message>);
		});
	});

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
