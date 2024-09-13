import { describe, expect, test } from "@rbxts/jest-globals";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../vitest";
import { boolean } from "../boolean/boolean";
import { number } from "../number";
import { optionalAsync } from "../optional";
import { type StringIssue, string } from "../string";
import { type TupleSchemaAsync, tupleAsync } from "./tupleAsync";
import type { TupleIssue } from "./types";

describe("tupleAsync", () => {
	describe("should return schema object", () => {
		const items = [optionalAsync(string()), number()] as const;
		type Items = typeof items;
		const baseSchema: Omit<TupleSchemaAsync<Items, never>, "message"> = {
			kind: "schema",
			type: "tuple",
			reference: tupleAsync,
			expects: "Array",
			items,
			async: true,
			_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const schema: TupleSchemaAsync<Items, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(tupleAsync(items)).toStrictEqual(schema);
			expect(tupleAsync(items, undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(tupleAsync(items, "message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies TupleSchemaAsync<Items, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(tupleAsync(items, message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies TupleSchemaAsync<Items, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		test("for empty tuple", async () => {
			await await expectNoSchemaIssueAsync(tupleAsync([]), [[]]);
		});

		const schema = tupleAsync([optionalAsync(string()), number()]);

		test("for simple tuple", async () => {
			await await expectNoSchemaIssueAsync(schema, [
				["foo", 123],
				[undefined, 123],
			]);
		});

		test("for unknown items", async () => {
			expect(await schema._run({ typed: false, value: ["foo", 123, null, true, undefined] }, {})).toStrictEqual({
				typed: true,
				value: ["foo", 123],
			});
		});
	});

	describe("should return dataset with issues", () => {
		const schema = tupleAsync([optionalAsync(string()), number()], "message");
		const baseIssue: Omit<TupleIssue, "input" | "received"> = {
			kind: "schema",
			type: "tuple",
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
		const schema = tupleAsync([optionalAsync(string()), number()]);

		test("for simple tuple", async () => {
			await expectNoSchemaIssueAsync(schema, [
				["foo", 123],
				[undefined, 123],
			]);
		});

		test("for nested tuple", async () => {
			await expectNoSchemaIssueAsync(tupleAsync([schema, schema]), [
				[
					["foo", 123],
					[undefined, 123],
				],
			]);
		});

		test("for unknown items", async () => {
			expect(await schema._run({ typed: false, value: ["foo", 123, null, true, undefined] }, {})).toStrictEqual({
				typed: true,
				value: ["foo", 123],
			});
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = tupleAsync([string(), number(), boolean()]);

		const baseInfo = {
			message: expect.any(String),
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
			path: [
				{
					type: "array",
					origin: "value",
					input: [123, 456, "true"],
					key: 0,
					value: 123,
				},
			],
		};

		test("for wrong items", async () => {
			const input = [123, 456, "true"];
			expect(await schema._run({ typed: false, value: input }, {})).toStrictEqual({
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
						path: [
							{
								type: "array",
								origin: "value",
								input: input,
								key: 2,
								value: input[2],
							},
						],
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", async () => {
			expect(await schema._run({ typed: false, value: [123, 456, "true"] }, { abortEarly: true })).toStrictEqual({
				typed: false,
				value: [],
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested items", async () => {
			const nestedSchema = tupleAsync([schema, schema]);
			const input: [[string, string, boolean], null] = [["foo", "123", false], null];
			expect(await nestedSchema._run({ typed: false, value: input }, {})).toStrictEqual({
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
						path: [
							{
								type: "array",
								origin: "value",
								input: input,
								key: 0,
								value: input[0],
							},
							{
								type: "array",
								origin: "value",
								input: input[0],
								key: 1,
								value: input[0][1],
							},
						],
					},
					{
						...baseInfo,
						kind: "schema",
						type: "tuple",
						input: null,
						expected: "Array",
						received: "null",
						path: [
							{
								type: "array",
								origin: "value",
								input: input,
								key: 1,
								value: input[1],
							},
						],
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof nestedSchema>>);
		});
	});
});
