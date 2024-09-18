import { describe, expect, test } from "@rbxts/jest-globals";
import { boolean, number, objectAsync, objectWithRestAsync, optionalAsync, string } from "../../schemas";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssueAsync } from "../../tests";
import { partialAsync } from "./partialAsync";

describe("partialAsync", () => {
	const entries = {
		key1: string(),
		key2: number(),
		key3: string(),
	};
	const baseInfo = {
		message: expect.any("string"),
		requirement: undefined,
		issues: undefined,
		lang: undefined,
		abortEarly: undefined,
		abortPipeEarly: undefined,
	} as const;

	describe("objectAsync", () => {
		const wrapped = objectAsync(entries);
		const schema1 = partialAsync(wrapped);
		const schema2 = partialAsync(wrapped, ["key1", "key3"]);

		describe("should return schema objectAsync", () => {
			test("with undefined keys", () => {
				expect(schema1).toStrictEqual({
					kind: "schema",
					type: "object",
					reference: objectAsync,
					expects: "Object",
					entries: {
						key1: {
							...optionalAsync(entries.key1),
							_run: expect.any("function"),
						},
						key2: {
							...optionalAsync(entries.key2),
							_run: expect.any("function"),
						},
						key3: {
							...optionalAsync(entries.key3),
							_run: expect.any("function"),
						},
					},
					message: undefined,
					async: true,
					_run: expect.any("function"),
				} satisfies typeof schema1);
			});

			test("with specific keys", () => {
				expect(schema2).toStrictEqual({
					kind: "schema",
					type: "object",
					reference: objectAsync,
					expects: "Object",
					entries: {
						key1: {
							...optionalAsync(entries.key1),
							_run: expect.any("function"),
						},
						key2: entries.key2,
						key3: {
							...optionalAsync(entries.key3),
							_run: expect.any("function"),
						},
					},
					message: undefined,
					async: true,
					_run: expect.any("function"),
				} satisfies typeof schema2);
			});
		});

		describe("should return dataset without nested issues", () => {
			test("if partialAsync keys are present", async () => {
				const input = { key1: "foo", key2: 123, key3: "bar" };
				await expectNoSchemaIssueAsync(schema1, [input]);
				await expectNoSchemaIssueAsync(schema2, [input]);
			});

			test("if partialAsync keys are missing", async () => {
				await expectNoSchemaIssueAsync(schema1, [{}]);
				await expectNoSchemaIssueAsync(schema2, [{ key2: 123 }]);
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if non-partialed keys are missing", async () => {
				for (const input of [{}, { key1: "foo", key3: "bar" }]) {
					expect(await schema2._run({ typed: false, value: input }, {})).toStrictEqual({
						typed: false,
						value: { ...input },
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

	describe("objectWithRestAsync", () => {
		const rest = boolean();
		const wrapped = objectWithRestAsync(entries, rest);
		const schema1 = partialAsync(wrapped);
		const schema2 = partialAsync(wrapped, ["key2", "key3"]);

		describe("should return schema objectAsync", () => {
			test("with undefined keys", () => {
				expect(schema1).toStrictEqual({
					kind: "schema",
					type: "object_with_rest",
					reference: objectWithRestAsync,
					expects: "Object",
					entries: {
						key1: {
							...optionalAsync(entries.key1),
							_run: expect.any("function"),
						},
						key2: {
							...optionalAsync(entries.key2),
							_run: expect.any("function"),
						},
						key3: {
							...optionalAsync(entries.key3),
							_run: expect.any("function"),
						},
					},
					rest,
					message: undefined,
					async: true,
					_run: expect.any("function"),
				} satisfies typeof schema1);
			});

			test("with specific keys", () => {
				expect(schema2).toStrictEqual({
					kind: "schema",
					type: "object_with_rest",
					reference: objectWithRestAsync,
					expects: "Object",
					entries: {
						key1: entries.key1,
						key2: {
							...optionalAsync(entries.key2),
							_run: expect.any("function"),
						},
						key3: {
							...optionalAsync(entries.key3),
							_run: expect.any("function"),
						},
					},
					rest,
					message: undefined,
					async: true,
					_run: expect.any("function"),
				} satisfies typeof schema2);
			});
		});

		describe("should return dataset without nested issues", () => {
			test("if partialAsync keys are present", async () => {
				const input = {
					key1: "foo",
					key2: 123,
					key3: "bar",
					other: true,
				};
				// @ts-expect-error
				await expectNoSchemaIssueAsync(schema1, [input]);
				// @ts-expect-error
				await expectNoSchemaIssueAsync(schema2, [input]);
			});

			test("if partialAsync keys are missing", async () => {
				await expectNoSchemaIssueAsync(schema1, [{}]);
				await expectNoSchemaIssueAsync(schema2, [{ key1: "foo", other: true } as any]);
			});
		});

		describe("should return dataset with nested issues", () => {
			test("if non-partialed keys are missing", async () => {
				for (const input of [{}, { key2: 123, key3: "bar", other: true }]) {
					expect(await schema2._run({ typed: false, value: input }, {})).toStrictEqual({
						typed: false,
						value: { ...input },
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
