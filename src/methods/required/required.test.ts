import { describe, expect, test } from "@rbxts/jest-globals";
import { boolean, nonOptional, number, object, objectWithRest, optional, string_ } from "../../schemas";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssue } from "../../tests";
import { required } from "./required";

describe("required", () => {
	const entries = {
		key1: optional(string_()),
		key2: optional(number()),
		key3: optional(string_()),
	};
	const baseInfo = {
		message: expect.any("string"),
		requirement: undefined,
		issues: undefined,
		lang: undefined,
		abortEarly: undefined,
		abortPipeEarly: undefined,
	} as const;

	describe("object", () => {
		const wrapped = object(entries);
		const schema1 = required(wrapped);
		const schema2 = required(wrapped, ["key1", "key3"]);

		describe("should return schema object", () => {
			// TODO: Add test for every overload signature

			test("with undefined keys", () => {
				expect(schema1).toEqual({
					kind: "schema",
					type: "object",
					reference: object,
					expects: "Object",
					entries: {
						key1: { ...nonOptional(entries.key1), _run: expect.any("function") },
						key2: { ...nonOptional(entries.key2), _run: expect.any("function") },
						key3: { ...nonOptional(entries.key3), _run: expect.any("function") },
					},
					message: undefined,
					async: false,
					_run: expect.any("function"),
				} satisfies typeof schema1);
			});

			test("with specific keys", () => {
				expect(schema2).toEqual({
					kind: "schema",
					type: "object",
					reference: object,
					expects: "Object",
					entries: {
						key1: { ...nonOptional(entries.key1), _run: expect.any("function") },
						key2: entries.key2,
						key3: { ...nonOptional(entries.key3), _run: expect.any("function") },
					},
					message: undefined,
					async: false,
					_run: expect.any("function"),
				} satisfies typeof schema2);
			});
		});

		describe("should return dataset without nested issues", () => {
			test("if required keys are present", () => {
				const input1 = { key1: "foo", key2: 123, key3: "bar" };
				expectNoSchemaIssue(schema1, [input1]);
				expectNoSchemaIssue(schema2, [input1]);
				const input2 = { key1: "foo", key3: "bar" };
				expect(schema2._run({ typed: false, value: input2 }, {})).toEqual({
					typed: true,
					value: { ...input2 },
				});
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if requireded keys are missing", () => {
				expect(schema1._run({ typed: false, value: {} }, {})).toEqual({
					typed: false,
					value: {},
					issues: [
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
					],
				} satisfies FailureDataset<InferIssue<typeof schema1>>);

				const input = { key2: 123 };
				expect(schema2._run({ typed: false, value: input }, {})).toEqual({
					typed: false,
					value: { ...input },
					issues: [
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
					],
				} satisfies FailureDataset<InferIssue<typeof schema2>>);
			});
		});
	});

	describe("objectWithRest", () => {
		const rest = boolean();
		const wrapped = objectWithRest(entries, rest);
		const schema1 = required(wrapped);
		const schema2 = required(wrapped, ["key2", "key3"]);

		describe("should return schema object", () => {
			// TODO: Add test for every overload signature

			test("with undefined keys", () => {
				expect(schema1).toEqual({
					kind: "schema",
					type: "object_with_rest",
					reference: objectWithRest,
					expects: "Object",
					entries: {
						key1: { ...nonOptional(entries.key1), _run: expect.any("function") },
						key2: { ...nonOptional(entries.key2), _run: expect.any("function") },
						key3: { ...nonOptional(entries.key3), _run: expect.any("function") },
					},
					rest,
					message: undefined,
					async: false,
					_run: expect.any("function"),
				} satisfies typeof schema1);
			});

			test("with specific keys", () => {
				expect(schema2).toEqual({
					kind: "schema",
					type: "object_with_rest",
					reference: objectWithRest,
					expects: "Object",
					entries: {
						key1: entries.key1,
						key2: { ...nonOptional(entries.key2), _run: expect.any("function") },
						key3: { ...nonOptional(entries.key3), _run: expect.any("function") },
					},
					rest,
					message: undefined,
					async: false,
					_run: expect.any("function"),
				} satisfies typeof schema2);
			});
		});

		describe("should return dataset without nested issues", () => {
			test("if required keys are present", () => {
				const input1 = {
					key1: "foo",
					key2: 123,
					key3: "bar",
					other: true,
				};
				expectNoSchemaIssue(schema1, [input1 as any]);
				expectNoSchemaIssue(schema2, [input1 as any]);
				const input2 = { key2: 123, key3: "bar", other: true };
				expect(schema2._run({ typed: false, value: input2 }, {})).toEqual({
					typed: true,
					value: { ...input2 },
				});
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if requireded keys are missing", () => {
				expect(schema1._run({ typed: false, value: {} }, {})).toEqual({
					typed: false,
					value: {},
					issues: [
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
					],
				} satisfies FailureDataset<InferIssue<typeof schema1>>);

				const input = { key1: "foo", other: true };
				expect(schema2._run({ typed: false, value: input }, {})).toEqual({
					typed: false,
					value: { ...input },
					issues: [
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
						{
							...baseInfo,
							kind: "schema",
							type: "non_optional",
							input: undefined,
							expected: "!undefined",
							received: "nil",
						},
					],
				} satisfies FailureDataset<InferIssue<typeof schema2>>);
			});
		});
	});
});
