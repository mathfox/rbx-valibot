import { describe, expect, test } from "@rbxts/jest-globals";
import {
	type BooleanIssue,
	type NumberIssue,
	type StringIssue,
	boolean,
	number,
	object,
	objectWithRest,
	string,
} from "../../schemas";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssue } from "../../tests";
import { pick } from "./pick";

describe("pick", () => {
	const entries = {
		key1: string(),
		key2: number(),
		key3: string(),
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
		const schema = pick(object(entries), ["key1", "key3"]);

		test("should return schema object", () => {
			expect(schema).toStrictEqual({
				kind: "schema",
				type: "object",
				reference: object,
				expects: "Object",
				entries: {
					key1: { ...string(), _run: expect.any("function") },
					key3: { ...string(), _run: expect.any("function") },
				},
				message: undefined,
				async: false,
				_run: expect.any("function"),
			} satisfies typeof schema);
		});

		describe("should return dataset without nested issues", () => {
			test("if picked keys are specified", () => {
				expectNoSchemaIssue(schema, [{ key1: "foo", key3: "bar" }]);
			});

			test("for unknown entries", () => {
				expect(
					schema._run(
						{
							typed: false,
							value: { key1: "foo", key2: 123, key3: "bar" },
						},
						{},
					),
				).toStrictEqual({
					typed: true,
					value: { key1: "foo", key3: "bar" },
				});
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if a picked key is missing", () => {
				expect(schema._run({ typed: false, value: { key3: "bar" } }, {})).toStrictEqual({
					typed: false,
					value: { key3: "bar" },
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
									input: { key3: "bar" },
									key: "key1",
									value: undefined,
								},
							],
						} satisfies StringIssue,
					],
				} satisfies UntypedDataset<InferIssue<typeof schema>>);
			});
		});
	});

	describe("objectWithRest", () => {
		const schema = pick(objectWithRest(entries, boolean()), ["key2", "key3"]);

		test("should return schema object", () => {
			expect(schema).toStrictEqual({
				kind: "schema",
				type: "object_with_rest",
				reference: objectWithRest,
				expects: "Object",
				entries: {
					key2: { ...number(), _run: expect.any("function") },
					key3: { ...string(), _run: expect.any("function") },
				},
				rest: { ...boolean(), _run: expect.any("function") },
				message: undefined,
				async: false,
				_run: expect.any("function"),
			} satisfies typeof schema);
		});

		describe("should return dataset without nested issues", () => {
			test("if picked keys are specified", () => {
				expectNoSchemaIssue(schema, [{ key2: 123, key3: "bar" } as any]);
			});

			test("if not picked key matches rest", () => {
				expectNoSchemaIssue(schema, [{ key1: false, key2: 123, key3: "bar" } as any]);
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if a picked key is missing", () => {
				expect(schema._run({ typed: false, value: { key3: "foo" } }, {})).toStrictEqual({
					typed: false,
					value: { key3: "foo" },
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
									input: { key3: "foo" },
									key: "key2",
									value: undefined,
								},
							],
						} satisfies NumberIssue,
					],
				} satisfies UntypedDataset<InferIssue<typeof schema>>);
			});

			test("if a not picked key does not match rest", () => {
				expect(schema._run({ typed: false, value: { key1: "foo", key2: 123, key3: "foo" } }, {})).toStrictEqual({
					typed: false,
					value: { key1: "foo", key2: 123, key3: "foo" },
					issues: [
						{
							...baseInfo,
							kind: "schema",
							type: "boolean",
							input: "foo",
							expected: "boolean",
							received: '"foo"',
							path: [
								{
									type: "object",
									origin: "value",
									input: { key1: "foo", key2: 123, key3: "foo" },
									key: "key1",
									value: "foo",
								},
							],
						} satisfies BooleanIssue,
					],
				} satisfies UntypedDataset<InferIssue<typeof schema>>);
			});
		});
	});
});
