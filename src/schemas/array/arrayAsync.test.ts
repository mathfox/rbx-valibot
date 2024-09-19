import { describe, expect, test } from "@rbxts/jest-globals";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { type StringIssue, string_ } from "../string";
import { type ArraySchemaAsync, arrayAsync } from "./arrayAsync";
import type { ArrayIssue } from "./types";

describe("arrayAsync", () => {
	describe("should return schema object", () => {
		const item = string_();
		type Item = typeof item;
		const baseSchema: Omit<ArraySchemaAsync<Item, never>, "message"> = {
			kind: "schema",
			type: "array",
			reference: arrayAsync,
			expects: "Array",
			item: { ...string_(), _run: expect.any("function") },
			async: true,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: ArraySchemaAsync<Item, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(arrayAsync(item)).toEqual(schema);
			expect(arrayAsync(item, undefined)).toEqual(schema);
		});

		test("with string message", () => {
			expect(arrayAsync(item, "message")).toEqual({
				...baseSchema,
				message: "message",
			} satisfies ArraySchemaAsync<Item, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(arrayAsync(item, message)).toEqual({
				...baseSchema,
				message,
			} satisfies ArraySchemaAsync<Item, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = arrayAsync(string_());

		test("for empty array", async () => {
			await expectNoSchemaIssueAsync(schema, [[]]);
		});

		test("for simple array", async () => {
			await expectNoSchemaIssueAsync(schema, [["foo", "bar", "baz"]]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = arrayAsync(string_(), "message");
		const baseIssue: Omit<ArrayIssue, "input" | "received"> = {
			kind: "schema",
			type: "array",
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
		const schema = arrayAsync(string_());

		test("for simple array", async () => {
			await expectNoSchemaIssueAsync(schema, [["foo", "bar", "baz"]]);
		});

		test("for nested array", async () => {
			await expectNoSchemaIssueAsync(arrayAsync(schema), [[["foo", "bar"], ["baz"]]]);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = arrayAsync(string_());

		const baseInfo = {
			//message: expect.any(String),
			message: expect.any(""),
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
			expect(await schema._run({ typed: false, value: ["foo", 123, "baz"] }, {})).toEqual({
				typed: false,
				value: ["foo", 123, "baz"],
				issues: [stringIssue],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", async () => {
			expect(await schema._run({ typed: false, value: ["foo", 123, "baz"] }, { abortEarly: true })).toEqual({
				typed: false,
				value: ["foo"],
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested items", async () => {
			const nestedSchema = arrayAsync(schema);
			expect(await nestedSchema._run({ typed: false, value: [[123, "foo"], "bar", []] }, {})).toEqual({
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
