import { describe, expect, test } from "@rbxts/jest-globals";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { boolean } from "../boolean";
import { number } from "../number";
import { optionalAsync } from "../optional";
import { type StringIssue, string_ } from "../string";
import { tupleWithRestAsync } from "./tupleWithRestAsync";
import type { TupleWithRestIssue } from "./types";
import { undefined_ } from "../undefined";

describe("tupleWithRestAsync", () => {
	describe("should return dataset without issues", () => {
		test("for empty tuple", async () => {
			await expectNoSchemaIssueAsync(tupleWithRestAsync([], undefined_()), [[]]);
		});

		const schema = tupleWithRestAsync([optionalAsync(string_()), number()], undefined_());

		test("for simple tuple", async () => {
			await expectNoSchemaIssueAsync(schema, [
				["foo", 123],
				[undefined, 123],
			]);
		});

		test("for rest items", async () => {
			await expectNoSchemaIssueAsync(schema, [
				[undefined, 123, undefined],
				["foo", 123, undefined, undefined, undefined],
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = tupleWithRestAsync([optionalAsync(string_()), number()], undefined_(), "message");
		const baseIssue: Omit<TupleWithRestIssue, "input" | "received"> = {
			kind: "schema",
			type: "tuple_with_rest",
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
		const schema = tupleWithRestAsync([optionalAsync(string_()), number()], undefined_());

		test("for simple tuple", async () => {
			await expectNoSchemaIssueAsync(schema, [
				["foo", 123],
				[undefined, 123],
			]);
		});

		test("for nested tuple", async () => {
			await expectNoSchemaIssueAsync(tupleWithRestAsync([schema, schema], undefined_()), [
				[["foo", 123], [undefined, 123, undefined], undefined],
			]);
		});

		test("for rest items", async () => {
			await expectNoSchemaIssueAsync(schema, [
				[undefined, 123, undefined],
				["foo", 123, undefined, undefined, undefined, undefined],
			]);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = tupleWithRestAsync([string_(), number(), boolean()], undefined_());

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
			const input = [123, 456, "true", undefined, undefined, undefined];
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
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", async () => {
			expect(
				await schema._run(
					{
						typed: false,
						value: [123, 456, "true", undefined, undefined, undefined],
					},
					{ abortEarly: true },
				),
			).toEqual({
				typed: false,
				value: [],
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested items", async () => {
			const nestedSchema = tupleWithRestAsync([schema, schema], undefined_());
			const input: [[string, string, boolean], number, number] = [["foo", "123", false], 3, 3];
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
						type: "tuple_with_rest",
						input: 3,
						expected: "Array",
						received: "3",
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof nestedSchema>>);
		});
	});
});
