import { describe, expect, test } from "@rbxts/jest-globals";
import { minLength } from "../../actions";
import { pipe } from "../../methods";
import type { FailureDataset, InferIssue, InferOutput, PartialDataset } from "../../types";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { literal } from "../literal/literal";
import { number } from "../number";
import { string_ } from "../string";
import { union } from "./union";
import RegExp from "@rbxts/regexp";

describe("union", () => {
	describe("should return dataset without issues", () => {
		test("for valid values", () => {
			expectNoSchemaIssue(union([literal("foo"), literal("bar"), number()]), ["foo", "bar", 123]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			message: expect.any("string"),
			requirement: undefined,
			path: undefined,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};

		test("with single typed issue", () => {
			const schema = union([pipe(string_(), minLength(5)), number()]);
			type Schema = typeof schema;
			expect(schema._run({ typed: false, value: "foo" }, {})).toEqual({
				typed: true,
				value: "foo",
				issues: [
					{
						...baseInfo,
						kind: "validation",
						type: "min_length",
						input: "foo",
						expected: ">=5",
						received: "3",
						requirement: 5,
					},
				],
			} satisfies PartialDataset<InferOutput<Schema>, InferIssue<Schema>>);
		});

		test("with zero untyped issue", () => {
			expectSchemaIssue(
				union([]),
				{
					kind: "schema",
					type: "union",
					expected: "never",
					message: expect.any("string"),
				},
				["foo", 123, undefined],
			);
		});

		test("with single untyped issue", () => {
			const schema = union([literal("foo")]);
			expect(schema._run({ typed: false, value: "bar" }, {})).toEqual({
				typed: false,
				value: "bar",
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "literal",
						input: "bar",
						expected: '"foo"',
						received: '"bar"',
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("with multiple typed issues", () => {
			const schema = union([string_(), number()]);
			expect(schema._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "union",
						input: undefined,
						expected: "(string | number)",
						received: "nil",
						issues: [
							{
								...baseInfo,
								kind: "schema",
								type: "string",
								input: undefined,
								expected: "string",
								received: "nil",
							},
							{
								...baseInfo,
								kind: "schema",
								type: "number",
								input: undefined,
								expected: "number",
								received: "nil",
							},
						],
					},
				],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});
	});
});
