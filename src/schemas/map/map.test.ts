import { describe, expect, test } from "@rbxts/jest-globals";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { number } from "../number";
import { type StringIssue, string_ } from "../string";
import { type MapSchema, map } from "./map";
import type { MapIssue } from "./types";
import { deepEquals } from "@rbxts/phantom/src/Shared";
import { removeKeys } from "@rbxts/phantom/src/Map";

describe("map", () => {
	describe("should return schema object", () => {
		const key = number();
		type Key = typeof key;
		const value = string_();
		type Value = typeof value;
		const baseSchema: Omit<MapSchema<Key, Value, never>, "message"> = {
			kind: "schema",
			type: "map",
			reference: map,
			expects: "Map",
			key,
			value,
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: MapSchema<Key, Value, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(map(key, value)).toEqual(schema);
			expect(map(key, value, undefined)).toEqual(schema);
		});

		test("with string message", () => {
			expect(map(key, value, "message")).toEqual({
				...baseSchema,
				message: "message",
			} satisfies MapSchema<Key, Value, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(map(key, value, message)).toEqual({
				...baseSchema,
				message,
			} satisfies MapSchema<Key, Value, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = map(number(), string_());

		test("for empty map", () => {
			expectNoSchemaIssue(schema, [new Map()]);
		});

		test("", () => {
			expectNoSchemaIssue(schema, [
				new Map([
					[0, "foo"],
					[1, "bar"],
					[2, "baz"],
				]),
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = map(number(), string_(), "message");
		const baseIssue: Omit<MapIssue, "input" | "received"> = {
			kind: "schema",
			type: "map",
			expected: "Map",
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

		test("for functions", () => {
			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
		});
	});

	describe("should return dataset without nested issues", () => {
		const schema = map(number(), string_());

		test("for simple map", () => {
			expectNoSchemaIssue(schema, [
				new Map([
					[0, "foo"],
					[1, "bar"],
					[2, "baz"],
				]),
			]);
		});

		test("for nested map", () => {
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
				deepEquals(map(schema, schema)._run({ typed: false, value }, {}), {
					typed: true,
					value,
				}),
			).toBe(true);
		});
	});

	describe("should return dataset with nested issues", () => {
		const schema = map(number(), string_());

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
			const input = new Map<unknown, unknown>([
				[0, "foo"],
				[1, 123],
				[2, "baz"],
				["string", "bar"],
			]);
			expect(schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("with abort early", () => {
			expect(
				schema._run(
					{
						typed: false,
						value: new Map<unknown, unknown>([
							[0, "foo"],
							[1, 123],
							[2, "baz"],
						]),
					},
					{ abortEarly: true },
				),
			).toEqual({
				typed: false,
				value: new Map(),
				issues: [{ ...stringIssue, abortEarly: true }],
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for wrong nested values", () => {
			const nestedSchema = map(schema, schema);
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

			const result = nestedSchema._run(
				{
					typed: false,
					value: input,
				},
				{},
			);

			expect(result.issues).toContainEqual({
				...baseInfo,
				kind: "schema",
				type: "string",
				input: 123,
				expected: "string",
				received: "123",
			});

			expect(result.issues).toContainEqual({
				...baseInfo,
				kind: "schema",
				type: "map",
				input: "bar",
				expected: "Map",
				received: '"bar"',
			});

			expect(
				deepEquals(removeKeys(result as unknown as Map<unknown, unknown>, "issues"), {
					typed: false,
					value: input,
				} satisfies Omit<FailureDataset<InferIssue<typeof nestedSchema>>, "issues">),
			).toBe(true);
		});
	});
});
