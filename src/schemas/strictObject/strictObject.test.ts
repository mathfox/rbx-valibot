import { describe, expect, test } from "@rbxts/jest-globals";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { number } from "../number";
import { object } from "../object";
import { optional } from "../optional";
import { type StringIssue, string_ } from "../string";
import { type StrictObjectSchema, strictObject } from "./strictObject";
import type { StrictObjectIssue } from "./types";

describe("strictObject", () => {
	describe("should return schema object", () => {
		const entries = { key: string_() };
		type Entries = typeof entries;
		const baseSchema: Omit<StrictObjectSchema<Entries, never>, "message"> = {
			kind: "schema",
			type: "strict_object",
			reference: strictObject,
			expects: "Object",
			entries,
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: StrictObjectSchema<Entries, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(strictObject(entries)).toEqual(schema);
			expect(strictObject(entries, undefined)).toEqual(schema);
		});

		test("with string message", () => {
			expect(strictObject(entries, "message")).toEqual({
				...baseSchema,
				message: "message",
			} satisfies StrictObjectSchema<Entries, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(strictObject(entries, message)).toEqual({
				...baseSchema,
				message,
			} satisfies StrictObjectSchema<Entries, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		test("for empty object", () => {
			expectNoSchemaIssue(strictObject({}), [{}]);
		});

		test("for simple object", () => {
			expectNoSchemaIssue(strictObject({ key1: string_(), key2: number() }), [{ key1: "foo", key2: 123 }]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = strictObject({}, "message");
		const baseIssue: Omit<StrictObjectIssue, "input" | "received"> = {
			kind: "schema",
			type: "strict_object",
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
			expectNoSchemaIssue(strictObject({ key1: string_(), key2: number() }), [{ key1: "foo", key2: 123 }]);
		});

		test("for nested object", () => {
			expectNoSchemaIssue(strictObject({ nested: object({ key: string_() }) }), [{ nested: { key: "foo" } }]);
		});

		test("for optional entry", () => {
			expectNoSchemaIssue(strictObject({ key: optional(string_()) }), [{}, { key: undefined }, { key: "foo" }]);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = strictObject({
			key: string_(),
			nested: object({ key: number() }),
		});

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
			received: "undefined",
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
						received: "undefined",
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for missing nested entries", () => {
			const input = { key: "value", nested: {} };
			expect(schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "number",
						input: undefined,
						expected: "number",
						received: "undefined",
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

		test("for unknown entries", () => {
			const input = {
				key: "foo",
				nested: { key: 123 },
				other1: "foo",
				other2: 123,
			};
			expect(schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: { key: input.key, nested: input.nested },
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "strict_object",
						input: input.other1,
						expected: "never",
						received: `"${input.other1}"`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});
	});
});
