import { describe, expect, test } from "@rbxts/jest-globals";
import { type BooleanIssue, type NumberIssue, boolean, number, object, objectWithRest, string_ } from "../../schemas";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssue } from "../../tests";
import { omit } from "./omit";

describe("omit", () => {
	const entries = {
		key1: string_(),
		key2: number(),
		key3: string_(),
		key4: number(),
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
		const schema = omit(object(entries), ["key1", "key3"]);

		test("should return schema object", () => {
			expect(schema).toEqual({
				kind: "schema",
				type: "object",
				reference: object,
				expects: "Object",
				entries: {
					key2: { ...number(), _run: expect.any("function") },
					key4: { ...number(), _run: expect.any("function") },
				},
				message: undefined,
				async: false,
				_run: expect.any("function"),
			} satisfies typeof schema);
		});

		describe("should return dataset without nested issues", () => {
			test("if not omitted keys are specified", () => {
				expectNoSchemaIssue(schema, [{ key2: 123, key4: 456 }]);
			});

			test("for unknown entries", () => {
				expect(
					schema._run(
						{
							typed: false,
							value: { key1: "foo", key2: 123, key4: 456, other: undefined },
						},
						{},
					),
				).toEqual({
					typed: true,
					value: { key2: 123, key4: 456 },
				});
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if a not omitted key is missing", () => {
				expect(schema._run({ typed: false, value: { key2: 123 } }, {})).toEqual({
					typed: false,
					value: { key2: 123 },
					issues: [
						{
							...baseInfo,
							kind: "schema",
							type: "number",
							input: undefined,
							expected: "number",
							received: "nil",
						} satisfies NumberIssue,
					],
				} satisfies FailureDataset<InferIssue<typeof schema>>);
			});
		});
	});

	describe("objectWithRest", () => {
		const schema = omit(objectWithRest(entries, boolean()), ["key2", "key3"]);

		test("should return schema object", () => {
			expect(schema).toEqual({
				kind: "schema",
				type: "object_with_rest",
				reference: objectWithRest,
				expects: "Object",
				entries: {
					key1: { ...string_(), _run: expect.any("function") },
					key4: { ...number(), _run: expect.any("function") },
				},
				rest: { ...boolean(), _run: expect.any("function") },
				message: undefined,
				async: false,
				_run: expect.any("function"),
			} satisfies typeof schema);
		});

		describe("should return dataset without nested issues", () => {
			test("if not omitted keys are specified", () => {
				expectNoSchemaIssue(schema, [{ key1: "foo", key4: 456 }] as any);
			});

			test("if omitted key matches rest", () => {
				expectNoSchemaIssue(schema, [{ key1: "foo", key2: true, key4: 456 }] as any);
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if a not omitted key is missing", () => {
				expect(schema._run({ typed: false, value: { key1: "foo" } }, {})).toEqual({
					typed: false,
					value: { key1: "foo" },
					issues: [
						{
							...baseInfo,
							kind: "schema",
							type: "number",
							input: undefined,
							expected: "number",
							received: "nil",
						} satisfies NumberIssue,
					],
				} satisfies FailureDataset<InferIssue<typeof schema>>);
			});

			test("if an omitted key does not match rest", () => {
				expect(schema._run({ typed: false, value: { key1: "foo", key4: 456, key_wtf: 1337 } }, {})).toEqual({
					typed: false,
					value: { key1: "foo", key4: 456, key_wtf: 1337 },
					issues: [
						{
							...baseInfo,
							kind: "schema",
							type: "boolean",
							input: 1337,
							expected: "boolean",
							received: "1337",
						} satisfies BooleanIssue,
					],
				} satisfies FailureDataset<InferIssue<typeof schema>>);
			});
		});
	});
});
