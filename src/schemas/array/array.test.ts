import { describe, expect, test } from "@rbxts/jest-globals";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type StringIssue, string_ } from "../string";
import { type ArraySchema, array } from "./array";
import type { ArrayIssue } from "./types";

describe("array", () => {
	describe("should return schema object", () => {
		const item = string_();
		type Item = typeof item;
		const baseSchema: Omit<ArraySchema<Item, never>, "message"> = {
			kind: "schema",
			type: "array",
			reference: array,
			expects: "Array",
			item,
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: ArraySchema<Item, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(array(item)).toEqual(schema);
			expect(array(item, undefined)).toEqual(schema);
		});

		test("with string message", () => {
			expect(array(item, "message")).toEqual({
				...baseSchema,
				message: "message",
			} satisfies ArraySchema<Item, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(array(item, message)).toEqual({
				...baseSchema,
				message,
			} satisfies ArraySchema<Item, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = array(string_());

		test("for empty array", () => {
			expectNoSchemaIssue(schema, [[]]);
		});

		test("for simple array", () => {
			expectNoSchemaIssue(schema, [["foo", "bar", "baz"]]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = array(string_(), "message");
		const baseIssue: Omit<ArrayIssue, "input" | "received"> = {
			kind: "schema",
			type: "array",
			expected: "Array",
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

		test("for functions", () => {
			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
		});

		test("for objects", () => {
			expectSchemaIssue(schema, baseIssue, [{ key: "value" }]);
		});
	});

	describe("should return dataset without nested issues", () => {
		const schema = array(string_());

		test("for simple array", () => {
			expectNoSchemaIssue(schema, [["foo", "bar", "baz"]]);
		});

		test("for nested array", () => {
			expectNoSchemaIssue(array(schema), [[["foo", "bar"], ["baz"]]]);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = array(string_());

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

		test("for wrong items", () => {
			expect(schema._run({ typed: false, value: ["foo", 123, "baz", undefined] }, {})).toEqual({
				typed: false,
				value: ["foo", 123, "baz", undefined],
				issues: [
					stringIssue,
					{
						...baseInfo,
						kind: "schema",
						type: "string",
						input: undefined,
						expected: "string",
						received: "nil",
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", () => {
			expect(schema._run({ typed: false, value: ["foo", 123, "baz", undefined] }, { abortEarly: true })).toEqual({
				typed: false,
				value: ["foo"],
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested items", () => {
			const nestedSchema = array(schema);
			expect(nestedSchema._run({ typed: false, value: [[123, "foo"], "bar", []] }, {})).toEqual({
				typed: false,
				value: [[123, "foo"], "bar", []],
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
						type: "array",
						input: "bar",
						expected: "Array",
						received: '"bar"',
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof nestedSchema>>);
		});
	});
});
