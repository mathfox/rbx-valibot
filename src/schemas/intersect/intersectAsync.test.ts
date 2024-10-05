import { describe, expect, test } from "@rbxts/jest-globals";
import { minLength, minValue, transform } from "../../actions";
import { pipe } from "../../methods";
import type { FailureDataset, InferIssue, InferOutput, PartialDataset } from "../../types";
import { expectNoSchemaIssueAsync } from "../../tests";
import { array } from "../array/array";
import { arrayAsync } from "../array/arrayAsync";
import { number } from "../number";
import { object, objectAsync } from "../object";
import { string_ } from "../string";
import { intersectAsync } from "./intersectAsync";

describe("intersectAsync", () => {
	describe("should return dataset without issues", () => {
		test("for valid values", async () => {
			await expectNoSchemaIssueAsync(
				intersectAsync([
					array(object({ key1: string_(), key2: number() })),
					arrayAsync(objectAsync({ key4: array(string_()) })),
				]),
				[
					[
						{ key1: "foo", key2: 123, key4: ["foo", "bar"] },
						{ key1: "bar", key2: -456, key4: ["baz"] },
					],
				],
			);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			message: expect.any("string"),
			requirement: undefined,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};

		test("for empty options", async () => {
			const schema = intersectAsync([]);
			const input = "foo";
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "intersect",
						input,
						expected: "never",
						received: `"${input}"`,
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("with untyped output", async () => {
			const schema = intersectAsync([string_(), number()]);
			const input = "foo";
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "number",
						input,
						expected: "number",
						received: `"${input}"`,
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("with typed output", async () => {
			const schema = intersectAsync([
				object({ key1: pipe(string_(), minLength(10)) }),
				objectAsync({ key2: pipe(number(), minValue(100)) }),
			]);
			type Schema = typeof schema;
			const input = { key1: "foo", key2: -123 };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: true,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "validation",
						type: "min_length",
						input: input.key1,
						expected: ">=10",
						received: "3",
						requirement: 10,
					},
					{
						...baseInfo,
						kind: "validation",
						type: "min_value",
						input: input.key2,
						expected: ">=100",
						received: "-123",
						requirement: 100,
					},
				],
			} satisfies PartialDataset<InferOutput<Schema>, InferIssue<Schema>>);
		});

		test("with abort early", async () => {
			const schema = intersectAsync([
				object({ key1: pipe(string_(), minLength(10)) }),
				objectAsync({ key2: pipe(number(), minValue(100)) }),
			]);
			const input = { key1: "foo", key2: -123 };
			expect(await schema._run({ typed: false, value: input }, { abortEarly: true })).toEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						abortEarly: true,
						kind: "validation",
						type: "min_length",
						input: input.key1,
						expected: ">=10",
						received: "3",
						requirement: 10,
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for merge error", async () => {
			const schema = intersectAsync([
				object({ key: string_() }),
				objectAsync({
					key: pipe(
						string_(),
						transform((input) => input.size()),
					),
				}),
			]);
			const input = { key: "foo" };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "intersect",
						input: input,
						expected: "Object",
						received: "unknown",
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});
	});
});
