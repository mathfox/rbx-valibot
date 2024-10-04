import { describe, expect, test } from "@rbxts/jest-globals";
import { boolean, number, object, objectWithRest, optional, string_ } from "../../schemas";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssue } from "../../tests";
import { partial } from "./partial";

describe("partial", () => {
	const entries = {
		key1: string_(),
		key2: number(),
		key3: string_(),
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
		const schema1 = partial(wrapped);
		const schema2 = partial(wrapped, ["key1", "key3"]);

		describe("should return schema object", () => {
			test("with undefined keys", () => {
				expect(schema1).toEqual({
					kind: "schema",
					type: "object",
					reference: object,
					expects: "Object",
					entries: {
						key1: { ...optional(entries.key1), _run: expect.any("function") },
						key2: { ...optional(entries.key2), _run: expect.any("function") },
						key3: { ...optional(entries.key3), _run: expect.any("function") },
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
						key1: { ...optional(entries.key1), _run: expect.any("function") },
						key2: entries.key2,
						key3: { ...optional(entries.key3), _run: expect.any("function") },
					},
					message: undefined,
					async: false,
					_run: expect.any("function"),
				} satisfies typeof schema2);
			});
		});

		describe("should return dataset without nested issues", () => {
			test("if partial keys are present", () => {
				const input = { key1: "foo", key2: 123, key3: "bar" };
				expectNoSchemaIssue(schema1, [input]);
				expectNoSchemaIssue(schema2, [input]);
			});

			test("if partial keys are missing", () => {
				expectNoSchemaIssue(schema1, [{}]);
				expectNoSchemaIssue(schema2, [{ key2: 123 }]);
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if non-partialed keys are missing", () => {
				for (const input of [{}, { key1: "foo", key3: "bar" }]) {
					expect(schema2._run({ typed: false, value: input }, {})).toEqual({
						typed: false,
						value: { ...input },
						issues: [
							{
								...baseInfo,
								kind: "schema",
								type: "number",
								input: undefined,
								expected: "number",
								received: "nil",
							},
						],
					} satisfies FailureDataset<InferIssue<typeof schema2>>);
				}
			});
		});
	});

	describe("objectWithRest", () => {
		const rest = boolean();
		const wrapped = objectWithRest(entries, rest);
		const schema1 = partial(wrapped);
		const schema2 = partial(wrapped, ["key2", "key3"]);

		describe("should return schema object", () => {
			test("with undefined keys", () => {
				expect(schema1).toEqual({
					kind: "schema",
					type: "object_with_rest",
					reference: objectWithRest,
					expects: "Object",
					entries: {
						key1: { ...optional(entries.key1), _run: expect.any("function") },
						key2: { ...optional(entries.key2), _run: expect.any("function") },
						key3: { ...optional(entries.key3), _run: expect.any("function") },
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
						key2: { ...optional(entries.key2), _run: expect.any("function") },
						key3: { ...optional(entries.key3), _run: expect.any("function") },
					},
					rest,
					message: undefined,
					async: false,
					_run: expect.any("function"),
				} satisfies typeof schema2);
			});
		});

		describe("should return dataset without nested issues", () => {
			test("if partial keys are present", () => {
				const input = {
					key1: "foo",
					key2: 123,
					key3: "bar",
					other: true,
				};
				expectNoSchemaIssue(schema1, [input as any]);
				expectNoSchemaIssue(schema2, [input as any]);
			});

			test("if partial keys are missing", () => {
				expectNoSchemaIssue(schema1, [{}]);
				expectNoSchemaIssue(schema2, [{ key1: "foo", other: true } as any]);
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if non-partialed keys are missing", () => {
				for (const input of [{}, { key2: 123, key3: "bar", other: true }]) {
					expect(schema2._run({ typed: false, value: input }, {})).toEqual({
						typed: false,
						value: { ...input },
						issues: [
							{
								...baseInfo,
								kind: "schema",
								type: "string",
								input: undefined,
								expected: "string",
								received: "nil",
							},
						],
					} satisfies FailureDataset<InferIssue<typeof schema2>>);
				}
			});
		});
	});
});
