import { describe, expect, test } from "@rbxts/jest-globals";
import { boolean, nullish, number, object, objectWithRest, optional, string } from "../../schemas/index.ts";
import type { InferIssue, UntypedDataset } from "../../types/index.ts";
import { expectNoSchemaIssue } from "../../vitest/index.ts";
import { partial } from "./partial.ts";

describe("partial", () => {
	const entries = {
		key1: string(),
		key2: number(),
		key3: string(),
		key4: nullish(number(), 123),
	};
	const baseInfo = {
		message: expect.any(String),
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
				expect(schema1).toStrictEqual({
					kind: "schema",
					type: "object",
					reference: object,
					expects: "Object",
					entries: {
						key1: { ...optional(entries.key1), _run: expect.any(Function) },
						key2: { ...optional(entries.key2), _run: expect.any(Function) },
						key3: { ...optional(entries.key3), _run: expect.any(Function) },
						key4: { ...optional(entries.key4), _run: expect.any(Function) },
					},
					message: undefined,
					async: false,
					_run: expect.any(Function),
				} satisfies typeof schema1);
			});

			test("with specific keys", () => {
				expect(schema2).toStrictEqual({
					kind: "schema",
					type: "object",
					reference: object,
					expects: "Object",
					entries: {
						key1: { ...optional(entries.key1), _run: expect.any(Function) },
						key2: entries.key2,
						key3: { ...optional(entries.key3), _run: expect.any(Function) },
						key4: entries.key4,
					},
					message: undefined,
					async: false,
					_run: expect.any(Function),
				} satisfies typeof schema2);
			});
		});

		describe("should return dataset without nested issues", () => {
			test("if partial keys are present", () => {
				const input = { key1: "foo", key2: 123, key3: "bar", key4: 123 };
				expectNoSchemaIssue(schema1, [input]);
				expectNoSchemaIssue(schema2, [input]);
			});

			test("if partial keys are missing", () => {
				expectNoSchemaIssue(schema1, [{}]);
				expectNoSchemaIssue(schema2, [{ key2: 123, key4: 123 }]);
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if non-partialed keys are missing", () => {
				for (const input of [{}, { key1: "foo", key3: "bar" }]) {
					expect(schema2._run({ typed: false, value: input }, {})).toStrictEqual({
						typed: false,
						value: { ...input, key4: 123 },
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
										input: input,
										key: "key2",
										value: undefined,
									},
								],
							},
						],
					} satisfies UntypedDataset<InferIssue<typeof schema2>>);
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
				expect(schema1).toStrictEqual({
					kind: "schema",
					type: "object_with_rest",
					reference: objectWithRest,
					expects: "Object",
					entries: {
						key1: { ...optional(entries.key1), _run: expect.any(Function) },
						key2: { ...optional(entries.key2), _run: expect.any(Function) },
						key3: { ...optional(entries.key3), _run: expect.any(Function) },
						key4: { ...optional(entries.key4), _run: expect.any(Function) },
					},
					rest,
					message: undefined,
					async: false,
					_run: expect.any(Function),
				} satisfies typeof schema1);
			});

			test("with specific keys", () => {
				expect(schema2).toStrictEqual({
					kind: "schema",
					type: "object_with_rest",
					reference: objectWithRest,
					expects: "Object",
					entries: {
						key1: entries.key1,
						key2: { ...optional(entries.key2), _run: expect.any(Function) },
						key3: { ...optional(entries.key3), _run: expect.any(Function) },
						key4: entries.key4,
					},
					rest,
					message: undefined,
					async: false,
					_run: expect.any(Function),
				} satisfies typeof schema2);
			});
		});

		describe("should return dataset without nested issues", () => {
			test("if partial keys are present", () => {
				const input = {
					key1: "foo",
					key2: 123,
					key3: "bar",
					key4: 123,
					other: true,
				};
				// @ts-expect-error
				expectNoSchemaIssue(schema1, [input]);
				// @ts-expect-error
				expectNoSchemaIssue(schema2, [input]);
			});

			test("if partial keys are missing", () => {
				expectNoSchemaIssue(schema1, [{}]);
				// @ts-expect-error
				expectNoSchemaIssue(schema2, [{ key1: "foo", key4: 123, other: true }]);
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if non-partialed keys are missing", () => {
				for (const input of [{}, { key2: 123, key3: "bar", other: true }]) {
					expect(schema2._run({ typed: false, value: input }, {})).toStrictEqual({
						typed: false,
						value: { ...input, key4: 123 },
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
										input: input,
										key: "key1",
										value: undefined,
									},
								],
							},
						],
					} satisfies UntypedDataset<InferIssue<typeof schema2>>);
				}
			});
		});
	});
});
