import { describe, expect, test } from "@rbxts/jest-globals";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { type NumberIssue, number } from "../number";
import { optionalAsync } from "../optional";
import { picklist } from "../picklist";
import { string_ } from "../string";
import { recordAsync } from "./recordAsync";
import type { RecordIssue } from "./types";

describe("recordAsync", () => {
	describe("should return dataset without issues", () => {
		const schema = recordAsync(string_(), number());

		test("for empty record", async () => {
			await expectNoSchemaIssueAsync(schema, [{}]);
		});

		test("for simple record", async () => {
			await expectNoSchemaIssueAsync(schema, [{ foo: 1, bar: 2, baz: 3 }]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = recordAsync(string_(), number(), "message");
		const baseIssue: Omit<RecordIssue, "input" | "received"> = {
			kind: "schema",
			type: "record",
			expected: "Object",
			message: "message",
		};

		// Primitive types

		test("for booleans", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [true, false]);
		});

		test("for numbers", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for undefined", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [undefined]);
		});

		test("for strings", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, ["", "abc", "123"]);
		});

		// Complex types

		// TODO: Enable this test again in case we find a reliable way to check for
		// plain objects
		// test('for arrays', async () => {
		//   await expectSchemaIssueAsync(schema, baseIssue, [[], ['value']]);
		// });

		test("for functions", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [() => {}, function () {}]);
		});
	});

	describe("should return dataset without nested issues", () => {
		const schema = recordAsync(picklist(["foo", "bar", "baz"]), optionalAsync(number()));

		test("for simple record", async () => {
			await expectNoSchemaIssueAsync(schema, [{ foo: 1, bar: 2, baz: 3 }]);
		});

		test("for nested record", async () => {
			await expectNoSchemaIssueAsync(recordAsync(string_(), schema), [
				{ foo: { foo: 1, bar: 2 }, bar: { baz: 3 } } as any,
			]);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = recordAsync(picklist(["foo", "bar", "baz"]), optionalAsync(number()));

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

		test("for wrong values", async () => {
			const input = {
				foo: 1,
				bar: "2",
				baz: undefined,
				other: 4,
			};
			expect(
				await schema._run(
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
					{
						...baseInfo,
						kind: "schema",
						type: "picklist",
						input: "other",
						expected: '("foo" | "bar" | "baz")',
						received: '"other"',
					},
					numberIssue1,
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", async () => {
			expect(
				await schema._run(
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
				value: {},
				issues: [{ ...numberIssue1, abortEarly: true }],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested values", async () => {
			const nestedSchema = recordAsync(string_(), schema);
			const input = {
				key1: {
					foo: 1,
					bar: "2",
					baz: undefined,
				},
				key2: 123,
			};
			expect(await nestedSchema._run({ typed: false, value: input }, {})).toEqual({
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
