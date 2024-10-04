import { describe, expect, test } from "@rbxts/jest-globals";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type NumberIssue, number } from "../number";
import { optional } from "../optional";
import { picklist } from "../picklist";
import { string_ } from "../string";
import { record } from "./record";
import type { RecordIssue } from "./types";

describe("record", () => {
	describe("should return dataset without issues", () => {
		const schema = record(string_(), number());

		test("for empty record", () => {
			expectNoSchemaIssue(schema, [{}]);
		});

		test("for simple record", () => {
			expectNoSchemaIssue(schema, [{ foo: 1, bar: 2, baz: 3 }]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = record(string_(), number(), "message");
		const baseIssue: Omit<RecordIssue, "input" | "received"> = {
			kind: "schema",
			type: "record",
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
		const schema = record(picklist(["foo", "bar", "baz"]), optional(number()));

		test("for simple record", () => {
			expectNoSchemaIssue(schema, [{ foo: 1, bar: 2, baz: 3 }]);
		});

		test("for nested record", () => {
			expectNoSchemaIssue(record(string_(), schema), [{ foo: { foo: 1, bar: 2 }, bar: { baz: 3 } } as any]);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = record(picklist(["foo", "bar", "baz"]), optional(number()));

		const baseInfo = {
			message: expect.any("string"),
			requirement: undefined,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};

		const numberIssue1: NumberIssue = {
			...baseInfo,
			kind: "schema",
			type: "number",
			input: "2",
			expected: "number",
			received: '"2"',
		};

		test("for wrong values", () => {
			const input = {
				foo: 1,
				bar: "2",
				baz: undefined,
				other: 4,
			};
			expect(
				schema._run(
					{
						typed: false,
						value: input,
					},
					{},
				),
			).toEqual({
				typed: false,
				value: {
					foo: input.foo,
					bar: input.bar,
					baz: input.baz,
				},
				issues: [
					numberIssue1,
					{
						...baseInfo,
						kind: "schema",
						type: "picklist",
						input: "other",
						expected: '("foo" | "bar" | "baz")',
						received: '"other"',
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", () => {
			expect(
				schema._run(
					{
						typed: false,
						value: {
							foo: 1,
							bar: "2",
							baz: undefined,
						},
					},
					{ abortEarly: true },
				),
			).toEqual({
				typed: false,
				value: { foo: 1 },
				issues: [{ ...numberIssue1, abortEarly: true }],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested values", () => {
			const nestedSchema = record(string_(), schema);
			const input = {
				key1: {
					foo: 1,
					bar: "2",
					baz: undefined,
				},
				key2: 123,
			};
			expect(nestedSchema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "number",
						input: input.key1.bar,
						expected: "number",
						received: '"2"',
					},
					{
						...baseInfo,
						kind: "schema",
						type: "record",
						input: input.key2,
						expected: "Object",
						received: "123",
					},
				],
			} satisfies FailureDataset<InferIssue<typeof nestedSchema>>);
		});
	});
});
