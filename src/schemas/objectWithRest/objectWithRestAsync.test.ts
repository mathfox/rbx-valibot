import { describe, expect, test } from "@rbxts/jest-globals";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { array } from "../array/array";
import type { ArrayIssue } from "../array/types";
import { boolean } from "../boolean";
import { never } from "../never";
import { number } from "../number";
import { object, objectAsync } from "../object";
import { optional } from "../optional";
import { type StringIssue, string_ } from "../string";
import { objectWithRestAsync } from "./objectWithRestAsync";
import type { ObjectWithRestIssue } from "./types";

describe("objectWithRestAsync", () => {
	describe("should return dataset without issues", () => {
		test("for empty object", async () => {
			await expectNoSchemaIssueAsync(objectWithRestAsync({}, boolean()), [{}]);
		});

		test("for simple object", async () => {
			await expectNoSchemaIssueAsync(objectWithRestAsync({ key1: string_(), key2: number() }, boolean()), [
				{ key1: "foo", key2: 123, other: true } as any,
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = objectWithRestAsync({}, never(), "message");
		const baseIssue: Omit<ObjectWithRestIssue, "input" | "received"> = {
			kind: "schema",
			type: "object_with_rest",
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
			await expectNoSchemaIssueAsync(objectWithRestAsync({ key1: string_(), key2: number() }, boolean()), [
				{ key1: "foo", key2: 123, other: true } as any,
			]);
		});

		test("for nested object", async () => {
			await expectNoSchemaIssueAsync(
				objectWithRestAsync({ nested: object({ key: string_() }) }, objectAsync({ key: number() })),
				[{ nested: { key: "foo" }, other: { key: 123 } } as any],
			);
		});

		test("for optional entry", async () => {
			await expectNoSchemaIssueAsync(objectWithRestAsync({ key: optional(string_()) }, number()), [
				{},
				{ key: undefined, other: 123 },
				{ key: "foo" } as any,
			]);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = objectWithRestAsync(
			{
				key: string_(),
				nested: objectAsync({ key: number() }),
			},
			array(boolean()),
		);

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
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
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
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", async () => {
			expect(await schema._run({ typed: false, value: {} }, { abortEarly: true })).toEqual({
				typed: false,
				value: {},
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		const arrayIssue: ArrayIssue = {
			...baseInfo,
			kind: "schema",
			type: "array",
			input: undefined,
			expected: "Array",
			received: "nil",
		};

		test("for wrong rest", async () => {
			const input = {
				key: "foo",
				nested: { key: 123 },
				other2: "bar",
			};
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "array",
						input: "bar",
						expected: "Array",
						received: '"bar"',
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for wrong rest with abort early", async () => {
			expect(
				await schema._run(
					{
						typed: false,
						value: {
							key: "foo",
							nested: { key: 123 },
							other2: "bar",
						},
					},
					{ abortEarly: true },
				),
			).toEqual({
				typed: false,
				value: {
					key: "foo",
					nested: { key: 123 },
				},
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "array",
						input: "bar",
						expected: "Array",
						received: '"bar"',
						abortEarly: true,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested rest", async () => {
			const input = {
				key: "foo",
				nested: { key: 123 },
				other: ["true"],
			};
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "boolean",
						input: "true",
						expected: "boolean",
						received: '"true"',
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});
	});
});
