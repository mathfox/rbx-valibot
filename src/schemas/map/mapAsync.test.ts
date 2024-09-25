import { describe, expect, test } from "@rbxts/jest-globals";
import type { InferIssue, UntypedDataset } from "../../types";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { number } from "../number";
import { type StringIssue, string_ } from "../string";
import { type MapSchemaAsync, mapAsync } from "./mapAsync";
import type { MapIssue } from "./types";
import { deepEquals } from "@rbxts/phantom/src/Shared";
import { removeKeys } from "@rbxts/phantom/src/Map";

describe("mapAsync", () => {
	describe("should return schema object", () => {
		const key = number();
		type Key = typeof key;
		const value = string_();
		type Value = typeof value;
		const baseSchema: Omit<MapSchemaAsync<Key, Value, never>, "message"> = {
			kind: "schema",
			type: "map",
			reference: mapAsync,
			expects: "Map",
			key,
			value,
			async: true,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: MapSchemaAsync<Key, Value, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(mapAsync(key, value)).toEqual(schema);
			expect(mapAsync(key, value, undefined)).toEqual(schema);
		});

		test("with string message", () => {
			expect(mapAsync(key, value, "message")).toEqual({
				...baseSchema,
				message: "message",
			} satisfies MapSchemaAsync<Key, Value, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(mapAsync(key, value, message)).toEqual({
				...baseSchema,
				message,
			} satisfies MapSchemaAsync<Key, Value, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = mapAsync(number(), string_());

		test("for empty mapAsync", async () => {
			await expectNoSchemaIssueAsync(schema, [new Map()]);
		});

		test("for simple mapAsync", async () => {
			await expectNoSchemaIssueAsync(schema, [
				new Map([
					[0, "foo"],
					[1, "bar"],
					[2, "baz"],
				]),
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = mapAsync(number(), string_(), "message");
		const baseIssue: Omit<MapIssue, "input" | "received"> = {
			kind: "schema",
			type: "map",
			expected: "Map",
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
	});

	describe("should return dataset without nested issues", () => {
		const schema = mapAsync(number(), string_());

		test("for simple mapAsync", async () => {
			await expectNoSchemaIssueAsync(schema, [
				new Map([
					[0, "foo"],
					[1, "bar"],
					[2, "baz"],
				]),
			]);
		});

		test("for nested mapAsync", async () => {
			const value = new Map([
				[
					new Map([
						[0, "foo"],
						[1, "bar"],
					]),
					new Map([[3, "baz"]]),
				],
			]);

			expect(
				deepEquals(await mapAsync(schema, schema)._run({ typed: false, value }, {}), {
					typed: true,
					value,
				}),
			).toBe(true);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = mapAsync(number(), string_());

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

		test("for wrong values", async () => {
			const input = new Map<unknown, unknown>([
				[0, "foo"],
				[1, 123],
				[2, "baz"],
				["string", "bar"],
			]);
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
				typed: false,
				value: input,
				issues: [
					stringIssue,
					{
						...baseInfo,
						kind: "schema",
						type: "number",
						input: "string",
						expected: "number",
						received: '"string"',
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", async () => {
			expect(
				await schema._run(
					{
						typed: false,
						value: new Map<unknown, unknown>([
							[0, "foo"],
							[1, 123],
							[2, "baz"],
							["string", "bar"],
						]),
					},
					{ abortEarly: true },
				),
			).toEqual({
				typed: false,
				value: new Map([]),
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested values", async () => {
			const nestedSchema = mapAsync(schema, schema);
			const input = new Map<unknown, unknown>([
				[
					new Map<unknown, unknown>([
						[0, 123],
						[1, "foo"],
					]),
					new Map(),
				],
				[new Map(), "bar"],
			]);

			const result = await nestedSchema._run(
				{
					typed: false,
					value: input,
				},
				{},
			);

			expect(result.issues).toContainEqual({
				...baseInfo,
				kind: "schema",
				type: "map",
				input: "bar",
				expected: "Map",
				received: '"bar"',
			});
			expect(result.issues).toContainEqual({
				...baseInfo,
				kind: "schema",
				type: "string",
				input: 123,
				expected: "string",
				received: "123",
			});

			expect(
				deepEquals(removeKeys(result as unknown as Map<unknown, unknown>, "issues"), {
					typed: false,
					value: input,
				} satisfies UntypedDataset<InferIssue<typeof nestedSchema>>),
			).toBe(true);
		});
	});
});
