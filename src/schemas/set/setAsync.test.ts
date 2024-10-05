import { describe, expect, test } from "@rbxts/jest-globals";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { type StringIssue, string_ } from "../string";
import { setAsync } from "./setAsync";
import type { SetIssue } from "./types";
import { deepEquals } from "@rbxts/phantom/src/Shared";

describe("setAsync", () => {
	describe("should return dataset without issues", () => {
		const schema = setAsync(string_());

		test("for empty setAsync", async () => {
			await expectNoSchemaIssueAsync(schema, [new Set()]);
		});

		test("for simple setAsync", async () => {
			await expectNoSchemaIssueAsync(schema, [new Set(["foo", "bar", "baz"])]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = setAsync(string_(), "message");
		const baseIssue: Omit<SetIssue, "input" | "received"> = {
			kind: "schema",
			type: "set",
			expected: "Set",
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

		test("for arrays", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [["value"]]);
		});

		test("for functions", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [() => {}, function () {}]);
		});

		test("for objects", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [{ key: "value" }]);
		});
	});

	describe("should return dataset without nested issues", () => {
		const schema = setAsync(string_());

		test("for simple setAsync", async () => {
			await expectNoSchemaIssueAsync(schema, [new Set(["foo", "bar", "baz"])]);
		});

		test("for nested setAsync", async () => {
			const value = new Set([new Set(["foo", "bar"]), new Set(["baz"])]);
			expect(
				deepEquals(await setAsync(schema)._run({ typed: false, value }), {
					typed: true,
					value,
				}),
			).toBe(true);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = setAsync(string_());

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
			input: 123,
			expected: "string",
			received: "123",
		};

		test("for wrong values", async () => {
			expect(await schema._run({ typed: false, value: new Set(["foo", 123, "baz", 1337]) }, {})).toEqual({
				typed: false,
				value: new Set(["foo", 123, "baz", 1337]),
				issues: [
					stringIssue,
					{
						...baseInfo,
						kind: "schema",
						type: "string",
						input: 1337,
						expected: "string",
						received: "1337",
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", async () => {
			expect(
				await schema._run({ typed: false, value: new Set(["foo", 123, "baz", 1337]) }, { abortEarly: true }),
			).toEqual({
				typed: false,
				value: new Set([]),
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested values", async () => {
			const nestedSchema = setAsync(schema);
			const input = new Set([new Set([123, "foo"]), "bar", new Set()]);

			expect(
				deepEquals(
					await nestedSchema._run(
						{
							typed: false,
							value: input,
						},
						{},
					),
					{
						typed: false,
						value: input,
						issues: [
							{
								...baseInfo,
								kind: "schema",
								type: "string",
								input: 123,
								expected: "string",
								received: "123",
							},
							{
								...baseInfo,
								kind: "schema",
								type: "set",
								input: "bar",
								expected: "Set",
								received: '"bar"',
							},
						],
					} satisfies FailureDataset<InferIssue<typeof nestedSchema>>,
				),
			).toBe(true);
		});
	});
});
