import { describe, expect, test } from "@rbxts/jest-globals";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { number } from "../number";
import { objectAsync } from "../object";
import { optional } from "../optional";
import { type StringIssue, string_ } from "../string";
import { strictObjectAsync } from "./strictObjectAsync";
import type { StrictObjectIssue } from "./types";

describe("strictObjectAsync", () => {
	describe("should return dataset without issues", () => {
		test("for empty object", async () => {
			await expectNoSchemaIssueAsync(strictObjectAsync({}), [{}]);
		});

		test("for simple object", async () => {
			await expectNoSchemaIssueAsync(strictObjectAsync({ key1: string_(), key2: number() }), [
				{ key1: "foo", key2: 123 },
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = strictObjectAsync({}, "message");
		const baseIssue: Omit<StrictObjectIssue, "input" | "received"> = {
			kind: "schema",
			type: "strict_object",
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
		test("for simple object", async () => {
			await expectNoSchemaIssueAsync(strictObjectAsync({ key1: string_(), key2: number() }), [
				{ key1: "foo", key2: 123 },
			]);
		});

		test("for nested object", async () => {
			await expectNoSchemaIssueAsync(strictObjectAsync({ nested: objectAsync({ key: string_() }) }), [
				{ nested: { key: "foo" } },
			]);
		});

		test("for optional entry", async () => {
			await expectNoSchemaIssueAsync(strictObjectAsync({ key: optional(string_()) }), [
				{},
				{ key: undefined },
				{ key: "foo" },
			]);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = strictObjectAsync({
			key: string_(),
			nested: objectAsync({ key: number() }),
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
			received: "nil",
		};

		test("for missing entries", async () => {
			expect(await schema._run({ typed: false, value: {} }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for missing nested entries", async () => {
			const input = { key: "value", nested: {} };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", async () => {
			expect(await schema._run({ typed: false, value: {} }, { abortEarly: true })).toEqual({
				typed: false,
				value: {},
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for unknown entries", async () => {
			const input = {
				key: "foo",
				nested: { key: 123 },
				other1: "foo",
				//other2: 123,
			};
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});
	});
});
