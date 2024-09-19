import { describe, expect, test } from "@rbxts/jest-globals";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { number } from "../number";
import { optional } from "../optional";
import { type StringIssue, string_ } from "../string";
import { object } from "./object";
import type { ObjectIssue } from "./types";

describe("object", () => {
	describe("should return dataset without issues", () => {
		test("for empty object", () => {
			expectNoSchemaIssue(object({}), [{}]);
		});

		test("for simple object", () => {
			expectNoSchemaIssue(object({ key1: string_(), key2: number() }), [{ key1: "foo", key2: 123 }]);
		});

		test("for unknown entries", () => {
			expect(object({ key1: string_() })._run({ typed: false, value: { key1: "foo", key2: 123 } }, {})).toEqual({
				typed: true,
				value: { key1: "foo" },
			});
		});
	});

	describe("should return dataset with issues", () => {
		const schema = object({}, "message");
		const baseIssue: Omit<ObjectIssue, "input" | "received"> = {
			kind: "schema",
			type: "object",
			expected: "Object",
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
			expectSchemaIssue(schema, baseIssue, ["", "abc", "123"]);
		});

		// Complex types

		// TODO: Enable this test again in case we find a reliable way to check for
		// plain objects
		// test('for arrays', () => {
		//   expectSchemaIssue(schema, baseIssue, [[], ['value']]);
		// });

		test("for functions", () => {
			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
		});
	});

	describe("should return dataset without nested issues", () => {
		test("for simple object", () => {
			expectNoSchemaIssue(object({ key1: string_(), key2: number() }), [{ key1: "foo", key2: 123 }]);
		});

		test("for nested object", () => {
			expectNoSchemaIssue(object({ nested: object({ key: string_() }) }), [{ nested: { key: "foo" } }]);
		});

		test("for optional entry", () => {
			expectNoSchemaIssue(object({ key: optional(string_()) }), [{}, { key: undefined }, { key: "foo" }]);
		});

		test("for unknown entries", () => {
			expect(
				object({ key1: string_() })._run({ typed: false, value: { key1: "foo", key2: 123, key3: undefined } }, {}),
			).toEqual({
				typed: true,
				value: { key1: "foo" },
			});
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = object({ key: string_(), nested: object({ key: number() }) });

		const baseInfo = {
			message: expect.any("string"),
			requirement: undefined,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};

		const stringIssue: StringIssue = {
			...baseInfo,
			kind: "schema",
			type: "string",
			input: undefined,
			expected: "string",
			received: "nil",
		};

		test("for missing entries", () => {
			expect(schema._run({ typed: false, value: {} }, {})).toEqual({
				typed: false,
				value: {},
				issues: [
					stringIssue,
					{
						...baseInfo,
						kind: "schema",
						type: "object",
						input: undefined,
						expected: "Object",
						received: "nil",
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for missing nested entries", () => {
			expect(schema._run({ typed: false, value: { key: "value", nested: {} } }, {})).toEqual({
				typed: false,
				value: { key: "value", nested: {} },
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "number",
						input: undefined,
						expected: "number",
						received: "nil",
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", () => {
			expect(schema._run({ typed: false, value: {} }, { abortEarly: true })).toEqual({
				typed: false,
				value: {},
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});
	});
});
