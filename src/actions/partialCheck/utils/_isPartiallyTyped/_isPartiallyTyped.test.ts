import { describe, expect, test } from "@rbxts/jest-globals";
import type { NumberIssue, ObjectIssue, StringIssue } from "../../../../schemas";
import type { TypedDataset, UntypedDataset } from "../../../../types";
import { _isPartiallyTyped } from "./_isPartiallyTyped";

describe("_isPartiallyTyped", () => {
	type Input = {
		nested: { key: string };
		tuple: [number, { key: string }, number];
		other: string;
	};
	const pathList = [
		["nested", "key"],
		["tuple", 1, "key"],
	] as const;

	const baseInfo = {
		message: "message",
		requirement: undefined,
		path: undefined,
		issues: undefined,
		lang: undefined,
		abortEarly: undefined,
		abortPipeEarly: undefined,
	};

	describe("should return false", () => {
		test("if issue has no path", () => {
			const dataset: UntypedDataset<ObjectIssue> = {
				typed: false,
				value: undefined,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "object",
						input: undefined,
						expected: "Object",
						received: "undefined",
						path: undefined,
					},
				],
			};
			expect(_isPartiallyTyped(dataset, pathList)).toBe(false);
		});

		test("if part of path matches path of issue", () => {
			const input = {
				nested: undefined,
				tuple: [123, { key: "foo" }, 456],
				other: "bar",
			};
			const dataset: UntypedDataset<ObjectIssue> = {
				typed: false,
				value: input,
				issues: [
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
								input,
								key: "nested",
								value: input.nested,
							},
						],
					},
				],
			};
			expect(_isPartiallyTyped(dataset, pathList)).toBe(false);
		});

		test("if entire path matches path of issue", () => {
			const input = {
				nested: { key: undefined },
				tuple: [123, { key: "foo" }, 456],
				other: "bar",
			};
			const dataset: UntypedDataset<StringIssue> = {
				typed: false,
				value: input,
				issues: [
					{
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
								input,
								key: "nested",
								value: input.nested,
							},
							{
								type: "object",
								origin: "value",
								input: input.nested,
								key: "key",
								value: input.nested.key,
							},
						],
					},
				],
			};
			expect(_isPartiallyTyped(dataset, pathList)).toBe(false);
		});
	});

	describe("should return true", () => {
		test("if there are no issues", () => {
			const input: Input = {
				nested: { key: "foo" },
				tuple: [123, { key: "baz" }, 456],
				other: "bar",
			};
			const dataset: TypedDataset<Input, never> = {
				typed: true,
				value: input,
			};
			expect(_isPartiallyTyped(dataset, pathList)).toBe(true);
		});

		test("if only unselected paths are untyped", () => {
			const input = {
				nested: { key: "foo" },
				tuple: [123, { key: "baz" }, undefined],
				other: undefined,
			};
			const dataset: UntypedDataset<NumberIssue | StringIssue> = {
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
								input,
								key: "tuple",
								value: input.tuple,
							},
							{
								type: "array",
								origin: "value",
								input: input.tuple,
								key: 2,
								value: input.tuple[2],
							},
						],
					},
					{
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
								input,
								key: "other",
								value: input.other,
							},
						],
					},
				],
			};
			expect(_isPartiallyTyped(dataset, pathList)).toBe(true);
		});
	});
});
