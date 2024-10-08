import { describe, expect, test } from "@rbxts/jest-globals";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type StringIssue, string_ } from "../string";
import { set } from "./set";
import type { SetIssue } from "./types";
import { deepEquals } from "@rbxts/phantom/src/Shared";

describe("set", () => {
	describe("should return dataset without issues", () => {
		const schema = set(string_());

		test("for empty set", () => {
			expectNoSchemaIssue(schema, [new Set()]);
		});

		test("for simple set", () => {
			expectNoSchemaIssue(schema, [new Set(["foo", "bar", "baz"])]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = set(string_(), "message");
		const baseIssue: Omit<SetIssue, "input" | "received"> = {
			kind: "schema",
			type: "set",
			expected: "Set",
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

		test("for arrays", () => {
			expectSchemaIssue(schema, baseIssue, [["value"]]);
		});

		test("for functions", () => {
			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
		});

		test("for objects", () => {
			expectSchemaIssue(schema, baseIssue, [{ key: "value" }]);
		});
	});

	describe("should return dataset without nested issues", () => {
		const schema = set(string_());

		test("for simple set", () => {
			expectNoSchemaIssue(schema, [new Set(["foo", "bar", "baz"])]);
		});

		test("for nested set", () => {
			const value = new Set([new Set(["foo", "bar"]), new Set(["baz"])]);
			expect(
				deepEquals(set(schema)._run({ typed: false, value }), {
					typed: true,
					value,
				}),
			).toBe(true);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = set(string_());

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

		test("for wrong values", () => {
			expect(schema._run({ typed: false, value: new Set(["foo", 123, "baz", 1337]) }, {})).toEqual({
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

		test("with abort early", () => {
			expect(schema._run({ typed: false, value: new Set(["foo", 123, "baz"]) }, { abortEarly: true })).toEqual({
				typed: false,
				value: new Set([]),
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});
	});
});
