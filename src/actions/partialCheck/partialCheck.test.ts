import { describe, expect, test } from "@rbxts/jest-globals";
import type { NumberIssue, ObjectIssue, StringIssue } from "../../schemas";
import type { DeepPickN, TypedDataset, UntypedDataset } from "../../types";
import { type PartialCheckAction, partialCheck } from "./partialCheck";
import type { PartialCheckIssue } from "./types";

describe("partialCheck", () => {
	describe("should return action object", () => {
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
		type Input = { nested: { key: string } };
		const pathList = [["nested", "key"]] as const;
		type PathList = typeof pathList;
		type Selection = DeepPickN<Input, PathList>;
		const requirement = (input: Selection) => input.nested.key.match("foo")[0] !== undefined;
		const baseAction: Omit<PartialCheckAction<Input, Selection, never>, "message"> = {
			kind: "validation",
			type: "partial_check",
			reference: partialCheck,
			expects: undefined,
			requirement,
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		};

		test("with undefined message", () => {
			const action: PartialCheckAction<Input, Selection, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(partialCheck<Input, PathList, Selection>(pathList, requirement)).toStrictEqual(action);
			expect(partialCheck<Input, PathList, Selection, undefined>(pathList, requirement, undefined)).toStrictEqual(
				action,
			);
		});

		test("with string message", () => {
			const message = "message";
			expect(partialCheck<Input, PathList, Selection, "message">(pathList, requirement, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies PartialCheckAction<Input, Selection, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(partialCheck<Input, PathList, Selection, typeof message>(pathList, requirement, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies PartialCheckAction<Input, Selection, typeof message>);
		});
	});

	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	type Input = {
		nested: { key: string };
		tuple: [number, { key: string }, number];
		other: string;
	};
	const pathList = [
		["nested", "key"],
		["tuple", 1, "key"],
	] as const;
	type PathList = typeof pathList;
	type Selection = DeepPickN<Input, PathList>;
	const requirement = (input: Selection) => input.nested.key === input.tuple[1].key;
	const action = partialCheck<Input, PathList, Selection, "message">(
		[
			["nested", "key"],
			["tuple", 1, "key"],
		],
		requirement,
		"message",
	);

	const baseInfo = {
		message: "message",
		requirement: undefined,
		path: undefined,
		issues: undefined,
		lang: undefined,
		abortEarly: undefined,
		abortPipeEarly: undefined,
	};

	describe("should return same dataset", () => {
		test("if root is untyped", () => {
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
			expect(action._run(dataset, {})).toStrictEqual(dataset);
		});

		test("if part of path is untyped", () => {
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
			expect(action._run(dataset, {})).toStrictEqual(dataset);
		});

		test("if entire path is untyped", () => {
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
			expect(action._run(dataset, {})).toStrictEqual(dataset);
		});

		test("if validation returns true", () => {
			const dataset: TypedDataset<Input, never> = {
				typed: true,
				value: {
					nested: { key: "foo" },
					tuple: [123, { key: "foo" }, 456],
					other: "bar",
				},
			};
			expect(action._run(dataset, {})).toStrictEqual(dataset);
		});
	});

	describe("should add issue to dataset", () => {
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
			expect(action._run(dataset, {})).toStrictEqual({
				...dataset,
				issues: [
					{
						...baseInfo,
						kind: "validation",
						type: "partial_check",
						input,
						expected: undefined,
						received: "Object",
						requirement,
					},
				],
			} satisfies TypedDataset<Input, PartialCheckIssue<Selection>>);
		});

		test("if only unselected paths are untyped", () => {
			const input: {
				nested: { key: string };
				tuple: [number, { key: string }, undefined];
				other: undefined;
			} = {
				nested: { key: "foo" },
				tuple: [123, { key: "baz" }, undefined],
				other: undefined,
			};
			const firstIssue: NumberIssue = {
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
			};
			const secondIssue: StringIssue = {
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
			};
			const dataset: UntypedDataset<NumberIssue | StringIssue> = {
				typed: false,
				value: input,
				issues: [firstIssue, secondIssue],
			};
			expect(action._run(dataset, {})).toStrictEqual({
				...dataset,
				issues: [
					firstIssue,
					secondIssue,
					{
						...baseInfo,
						kind: "validation",
						type: "partial_check",
						input: input,
						expected: undefined,
						received: "Object",
						requirement,
					},
				],
			} satisfies UntypedDataset<NumberIssue | StringIssue | PartialCheckIssue<Selection>>);
		});
	});
});
