import { describe, expect, test } from "@rbxts/jest-globals";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { boolean } from "../boolean";
import { number } from "../number";
import { optionalAsync } from "../optional";
import { type StringIssue, string_ } from "../string";
import { strictTupleAsync } from "./strictTupleAsync";
import type { StrictTupleIssue } from "./types";

describe("strictTupleAsync", () => {
	describe("should return dataset without issues", () => {
		test("for empty tuple", async () => {
			await expectNoSchemaIssueAsync(strictTupleAsync([]), [[]]);
		});

		test("for simple tuple", async () => {
			await expectNoSchemaIssueAsync(strictTupleAsync([optionalAsync(string_()), number()]), [
				["foo", 123],
				[undefined, 123],
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = strictTupleAsync([optionalAsync(string_()), number()], "message");
		const baseIssue: Omit<StrictTupleIssue, "input" | "received"> = {
			kind: "schema",
			type: "strict_tuple",
			expected: "Array",
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

		test("for functions", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [() => {}, function () {}]);
		});

		test("for objects", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [{}, { key: "value" }]);
		});
	});

	describe("should return dataset without nested issues", () => {
		const schema = strictTupleAsync([optionalAsync(string_()), number()]);

		test("for simple tuple", async () => {
			await expectNoSchemaIssueAsync(schema, [
				["foo", 123],
				[undefined, 123],
			]);
		});

		test("for nested tuple", async () => {
			await expectNoSchemaIssueAsync(strictTupleAsync([schema, schema]), [
				[
					["foo", 123],
					[undefined, 123],
				],
			]);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = strictTupleAsync([string_(), number(), boolean()]);

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

		test("for wrong items", async () => {
			const input = [123, 456, "true"];
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					stringIssue,
					{
						...baseInfo,
						kind: "schema",
						type: "boolean",
						input: "true",
						expected: "boolean",
						received: '"true"',
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", async () => {
			expect(await schema._run({ typed: false, value: [123, 456, "true"] }, { abortEarly: true })).toEqual({
				typed: false,
				value: [],
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested items", async () => {
			const nestedSchema = strictTupleAsync([schema, schema]);
			const input: [[string, string, boolean], number] = [["foo", "123", false], 3];
			expect(await nestedSchema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "number",
						input: "123",
						expected: "number",
						received: '"123"',
					},
					{
						...baseInfo,
						kind: "schema",
						type: "strict_tuple",
						input: 3,
						expected: "Array",
						received: "3",
					},
				],
			} satisfies FailureDataset<InferIssue<typeof nestedSchema>>);
		});

		test("for unknown items", async () => {
			const input = ["foo", 123, true, 3];
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: ["foo", 123, true],
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "strict_tuple",
						input: 3,
						expected: "never",
						received: "3",
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});
	});
});
