//import { describe, expect, test } from "@rbxts/jest-globals";
//import { email, minLength } from "../../actions";
//import { pipe } from "../../methods";
//import type { InferIssue, InferOutput, TypedDataset, UntypedDataset } from "../../types";
//import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
//import { literal } from "../literal/literal";
//import { number } from "../number";
//import { string } from "../string";
//import { type UnionSchema, union } from "./union";
//import RegExp from "@rbxts/regexp";
//
//describe("union", () => {
//	describe("should return schema object", () => {
//		const options = [literal("foo"), literal("bar"), number()] as const;
//		type Options = typeof options;
//		const baseSchema: Omit<UnionSchema<Options, never>, "message"> = {
//			kind: "schema",
//			type: "union",
//			reference: union,
//			expects: '("foo" | "bar" | number)',
//			options,
//			async: false,
//			_run: expect.any("function"),
//		};
//
//		test("with undefined message", () => {
//			const schema: UnionSchema<Options, undefined> = {
//				...baseSchema,
//				message: undefined,
//			};
//			expect(union(options)).toEqual(schema);
//			expect(union(options, undefined)).toEqual(schema);
//		});
//
//		test("with string message", () => {
//			expect(union(options, "message")).toEqual({
//				...baseSchema,
//				message: "message",
//			} satisfies UnionSchema<Options, "message">);
//		});
//
//		test("with function message", () => {
//			const message = () => "message";
//			expect(union(options, message)).toEqual({
//				...baseSchema,
//				message,
//			} satisfies UnionSchema<Options, typeof message>);
//		});
//	});
//
//	describe("should return dataset without issues", () => {
//		test("for valid values", () => {
//			expectNoSchemaIssue(union([literal("foo"), literal("bar"), number()]), ["foo", "bar", 123]);
//		});
//	});
//
//	describe("should return dataset with issues", () => {
//		const baseInfo = {
//			message: expect.any("string"),
//			requirement: undefined,
//			path: undefined,
//			issues: undefined,
//			lang: undefined,
//			abortEarly: undefined,
//			abortPipeEarly: undefined,
//		};
//
//		test("with single typed issue", () => {
//			const schema = union([pipe(string(), minLength(5)), number()]);
//			type Schema = typeof schema;
//			expect(schema._run({ typed: false, value: "foo" }, {})).toEqual({
//				typed: true,
//				value: "foo",
//				issues: [
//					{
//						...baseInfo,
//						kind: "validation",
//						type: "min_length",
//						input: "foo",
//						expected: ">=5",
//						received: "3",
//						requirement: 5,
//					},
//				],
//			} satisfies TypedDataset<InferOutput<Schema>, InferIssue<Schema>>);
//		});
//
//		test("with multiple typed issues", () => {
//			const schema = union([pipe(string(), email()), string()]);
//			type Schema = typeof schema;
//			expect(schema._run({ typed: false, value: "foo" }, {})).toEqual({
//				typed: true,
//				value: "foo",
//				issues: [
//					{
//						...baseInfo,
//						kind: "schema",
//						type: "union",
//						input: "foo",
//						// TODO: Investigate if there is a better solution for `expected`
//						// and `received` to prevent such situations that are not logical
//						expected: "string",
//						received: '"foo"',
//						issues: [
//							{
//								...baseInfo,
//								kind: "validation",
//								type: "email",
//								input: "foo",
//								expected: undefined,
//								received: '"foo"',
//								requirement: expect.any(RegExp),
//							},
//						],
//					},
//				],
//			} satisfies TypedDataset<InferOutput<Schema>, InferIssue<Schema>>);
//		});
//
//		test("with zero untyped issue", () => {
//			expectSchemaIssue(
//				union([]),
//				{
//					kind: "schema",
//					type: "union",
//					expected: "never",
//					message: expect.any("string"),
//				},
//				["foo", 123, null, undefined],
//			);
//		});
//
//		test("with single untyped issue", () => {
//			const schema = union([literal("foo")]);
//			expect(schema._run({ typed: false, value: "bar" }, {})).toEqual({
//				typed: false,
//				value: "bar",
//				issues: [
//					{
//						...baseInfo,
//						kind: "schema",
//						type: "literal",
//						input: "bar",
//						expected: '"foo"',
//						received: '"bar"',
//					},
//				],
//			} satisfies UntypedDataset<InferIssue<typeof schema>>);
//		});
//
//		test("with multiple typed issues", () => {
//			const schema = union([string(), number()]);
//			expect(schema._run({ typed: false, value: undefined }, {})).toEqual({
//				typed: false,
//				value: undefined,
//				issues: [
//					{
//						...baseInfo,
//						kind: "schema",
//						type: "union",
//						input: undefined,
//						expected: "(string | number)",
//						received: "null",
//						issues: [
//							{
//								...baseInfo,
//								kind: "schema",
//								type: "string",
//								input: undefined,
//								expected: "string",
//								received: "null",
//							},
//							{
//								...baseInfo,
//								kind: "schema",
//								type: "number",
//								input: undefined,
//								expected: "number",
//								received: "null",
//							},
//						],
//					},
//				],
//			} satisfies UntypedDataset<InferIssue<typeof schema>>);
//		});
//	});
//});
