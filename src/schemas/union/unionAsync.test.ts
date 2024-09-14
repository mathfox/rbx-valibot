import { describe, expect, test } from "@rbxts/jest-globals";
import { url, email, minLength } from "../../actions";
import { pipe } from "../../methods";
import type { InferIssue, InferOutput, TypedDataset, UntypedDataset } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { literal } from "../literal/literal";
import { number } from "../number";
import { string } from "../string";
import { type UnionSchemaAsync, unionAsync } from "./unionAsync";

describe("unionAsync", () => {
	describe("should return schema object", () => {
		const options = [literal("foo"), literal("bar"), number()] as const;
		type Options = typeof options;
		const baseSchema: Omit<UnionSchemaAsync<Options, never>, "message"> = {
			kind: "schema",
			type: "union",
			reference: unionAsync,
			expects: '("foo" | "bar" | number)',
			options,
			async: true,
			_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const schema: UnionSchemaAsync<Options, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(unionAsync(options)).toStrictEqual(schema);
			expect(unionAsync(options, undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(unionAsync(options, "message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies UnionSchemaAsync<Options, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(unionAsync(options, message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies UnionSchemaAsync<Options, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		test("for valid values", async () => {
			await expectNoSchemaIssueAsync(unionAsync([literal("foo"), literal("bar"), number()]), ["foo", "bar", 123]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			message: expect.any(String),
			requirement: undefined,
			path: undefined,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};

		test("with single typed issue", async () => {
			const schema = unionAsync([pipe(string(), minLength(5)), number()]);
			type Schema = typeof schema;
			expect(await schema._run({ typed: false, value: "foo" }, {})).toStrictEqual({
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
			} satisfies TypedDataset<InferOutput<Schema>, InferIssue<Schema>>);
		});

		test("with multiple typed issues", async () => {
			const schema = unionAsync([pipe(string(), email()), pipe(string(), url())]);
			type Schema = typeof schema;
			expect(await schema._run({ typed: false, value: "foo" }, {})).toStrictEqual({
				typed: true,
				value: "foo",
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "union",
						input: "foo",
						// TODO: Investigate if there is a better solution for `expected`
						// and `received` to prevent such situations that are not logical
						expected: "string",
						received: '"foo"',
						issues: [
							{
								...baseInfo,
								kind: "validation",
								type: "email",
								input: "foo",
								expected: null,
								received: '"foo"',
								requirement: expect.any(RegExp),
							},
							{
								...baseInfo,
								kind: "validation",
								type: "url",
								input: "foo",
								expected: null,
								received: '"foo"',
								requirement: expect.any(Function),
							},
						],
					},
				],
			} satisfies TypedDataset<InferOutput<Schema>, InferIssue<Schema>>);
		});

		test("with zero untyped issue", async () => {
			await expectSchemaIssueAsync(
				unionAsync([]),
				{
					kind: "schema",
					type: "union",
					expected: "never",
					message: expect.any(String),
				},
				["foo", 123, null, undefined],
			);
		});

		test("with single untyped issue", async () => {
			const schema = unionAsync([literal("foo")]);
			expect(await schema._run({ typed: false, value: "bar" }, {})).toStrictEqual({
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
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("with multiple typed issues", async () => {
			const schema = unionAsync([string(), number()]);
			expect(await schema._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: false,
				value: null,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "union",
						input: null,
						expected: "(string | number)",
						received: "null",
						issues: [
							{
								...baseInfo,
								kind: "schema",
								type: "string",
								input: null,
								expected: "string",
								received: "null",
							},
							{
								...baseInfo,
								kind: "schema",
								type: "number",
								input: null,
								expected: "number",
								received: "null",
							},
						],
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});
	});
});
