import { describe, expect, test } from "@rbxts/jest-globals";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { array } from "../array/array";
import type { ArrayIssue } from "../array/types";
import { boolean } from "../boolean";
import { never } from "../never";
import { number } from "../number";
import { object } from "../object";
import { optional } from "../optional";
import { type StringIssue, string } from "../string";
import { type ObjectWithRestSchema, objectWithRest } from "./objectWithRest";
import type { ObjectWithRestIssue } from "./types";

describe("objectWithRest", () => {
	describe("should return schema object", () => {
		const entries = { key: string() };
		type Entries = typeof entries;
		const rest = number();
		type Rest = typeof rest;
		const baseSchema: Omit<ObjectWithRestSchema<Entries, Rest, never>, "message"> = {
			kind: "schema",
			type: "object_with_rest",
			reference: objectWithRest,
			expects: "Object",
			entries,
			rest,
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: ObjectWithRestSchema<Entries, Rest, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(objectWithRest(entries, rest)).toStrictEqual(schema);
			expect(objectWithRest(entries, rest, undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(objectWithRest(entries, rest, "message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies ObjectWithRestSchema<Entries, Rest, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(objectWithRest(entries, rest, message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies ObjectWithRestSchema<Entries, Rest, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		test("for empty object", () => {
			expectNoSchemaIssue(objectWithRest({}, boolean()), [{}]);
		});

		test("for simple object", () => {
			expectNoSchemaIssue(
				objectWithRest({ key1: string(), key2: number() }, boolean()),
				// @ts-expect-error
				[{ key1: "foo", key2: 123, other: true }],
			);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = objectWithRest({}, never(), "message");
		const baseIssue: Omit<ObjectWithRestIssue, "input" | "received"> = {
			kind: "schema",
			type: "object_with_rest",
			expected: "Object",
			message: "message",
		};

		// Primitive types

		test("for booleans", () => {
			expectSchemaIssue(schema, baseIssue, [true, false]);
		});

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for undefined", () => {
			expectSchemaIssue(schema, baseIssue, [undefined]);
		});

		test("for strings", () => {
			expectSchemaIssue(schema, baseIssue, ["", "abc", "123"]);
		});

		// Complex types

		// TODO: Enable this test again in case we find a reliable way to check for
		// plain objects
		// test('for arrays', () => {
		//   expectSchemaIssue(schema, baseIssue, [[], ['value']]);
		// });

		test("for functions", () => {
			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
		});
	});

	describe("should return dataset without nested issues", () => {
		test("for simple object", () => {
			expectNoSchemaIssue(
				objectWithRest({ key1: string(), key2: number() }, boolean()),
				// @ts-expect-error
				[{ key1: "foo", key2: 123, other: true }],
			);
		});

		test("for nested object", () => {
			expectNoSchemaIssue(
				objectWithRest({ nested: object({ key: string() }) }, object({ key: number() })),
				// @ts-expect-error
				[{ nested: { key: "foo" }, other: { key: 123 } }],
			);
		});

		test("for optional entry", () => {
			expectNoSchemaIssue(
				objectWithRest({ key: optional(string()) }, number()),
				// @ts-expect-error
				[{}, { key: undefined, other: 123 }, { key: "foo" }],
			);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = objectWithRest(
			{
				key: string(),
				nested: object({ key: number() }),
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
			received: "undefined",
			path: [
				{
					type: "object",
					origin: "value",
					input: {},
					key: "key",
					value: undefined,
				},
			],
		};

		test("for missing entries", () => {
			expect(schema._run({ typed: false, value: {} }, {})).toStrictEqual({
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
						received: "undefined",
						path: [
							{
								type: "object",
								origin: "value",
								input: {},
								key: "nested",
								value: undefined,
							},
						],
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for missing nested entries", () => {
			const input = { key: "value", nested: {} };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "number",
						input: undefined,
						expected: "number",
						received: "undefined",
						path: [
							{
								type: "object",
								origin: "value",
								input: { key: "value", nested: {} },
								key: "nested",
								value: {},
							},
							{
								type: "object",
								origin: "value",
								input: {},
								key: "key",
								value: undefined,
							},
						],
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", () => {
			expect(schema._run({ typed: false, value: {} }, { abortEarly: true })).toStrictEqual({
				typed: false,
				value: {},
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		const arrayIssue: ArrayIssue = {
			...baseInfo,
			kind: "schema",
			type: "array",
			input: null,
			expected: "Array",
			received: "null",
			path: [
				{
					type: "object",
					origin: "value",
					input: {
						key: "foo",
						nested: { key: 123 },
						other1: null,
						other2: "bar",
					},
					key: "other1",
					value: null,
				},
			],
		};

		test("for wrong rest", () => {
			const input = {
				key: "foo",
				nested: { key: 123 },
				other1: null,
				other2: "bar",
			};
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					arrayIssue,
					{
						...baseInfo,
						kind: "schema",
						type: "array",
						input: "bar",
						expected: "Array",
						received: '"bar"',
						path: [
							{
								type: "object",
								origin: "value",
								input,
								key: "other2",
								value: input.other2,
							},
						],
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for worng rest with abort early", () => {
			expect(
				schema._run(
					{
						typed: false,
						value: {
							key: "foo",
							nested: { key: 123 },
							other1: null,
							other2: "bar",
						},
					},
					{ abortEarly: true },
				),
			).toStrictEqual({
				typed: false,
				value: {
					key: "foo",
					nested: { key: 123 },
				},
				issues: [{ ...arrayIssue, abortEarly: true }],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested rest", () => {
			const input = {
				key: "foo",
				nested: { key: 123 },
				other: ["true"],
			};
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
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
						path: [
							{
								type: "object",
								origin: "value",
								input,
								key: "other",
								value: input.other,
							},
							{
								type: "array",
								origin: "value",
								input: input.other,
								key: 0,
								value: input.other[0],
							},
						],
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});
	});
});
