import { describe, expect, test } from "@rbxts/jest-globals";
import {
	boolean,
	number,
	object,
	objectAsync,
	optional,
	optionalAsync,
	strictObjectAsync,
	strictTupleAsync,
	string_,
	tuple,
	tupleAsync,
} from "../../schemas";
import { getDefaultsAsync } from "./getDefaultsAsync";

describe("getDefaultsAsync", () => {
	test("should return undefined", async () => {
		expect(await getDefaultsAsync(string_())).toBeUndefined();
		expect(await getDefaultsAsync(number())).toBeUndefined();
		expect(await getDefaultsAsync(boolean())).toBeUndefined();
	});

	test("should return default", async () => {
		expect(await getDefaultsAsync(optional(string_(), "foo"))).toBe("foo");
		expect(await getDefaultsAsync(optional(number(), () => 123 as const))).toBe(123);
		expect(await getDefaultsAsync(optionalAsync(boolean(), async () => false as const))).toBe(false);
	});

	describe("should return object defaults", () => {
		test("for empty object", async () => {
			expect(await getDefaultsAsync(object({}))).toStrictEqual({});
		});

		test("for simple object", async () => {
			expect(
				await getDefaultsAsync(
					objectAsync({
						key1: optional(string_(), "foo"),
						key2: optional(number(), () => 123 as const),
						key3: optionalAsync(boolean(), false),
						key4: string_(),
					}),
				),
			).toStrictEqual({
				key1: "foo",
				key2: 123,
				key3: false,
				key4: undefined,
			});
		});

		test("for nested object", async () => {
			expect(
				await getDefaultsAsync(
					objectAsync({
						nested: strictObjectAsync({
							key1: optional(string_(), "foo"),
							key2: optional(number(), () => 123 as const),
							key3: optionalAsync(boolean(), false),
						}),
						other: string_(),
					}),
				),
			).toStrictEqual({
				nested: {
					key1: "foo",
					key2: 123,
					key3: false,
				},
				other: undefined,
			});
		});
	});

	describe("should return tuple defaults", () => {
		test("for empty tuple", async () => {
			expect(await getDefaultsAsync(tuple([]))).toStrictEqual([]);
		});

		test("for simple tuple", async () => {
			expect(
				await getDefaultsAsync(
					tupleAsync([
						optional(string_(), "foo"),
						optional(number(), () => 123 as const),
						optionalAsync(boolean(), false),
						string_(),
					]),
				),
			).toStrictEqual(["foo", 123, false, undefined]);
		});

		test("for nested tuple", async () => {
			expect(
				await getDefaultsAsync(
					tupleAsync([
						strictTupleAsync([
							optional(string_(), "foo"),
							optional(number(), () => 123 as const),
							optionalAsync(boolean(), false),
						]),
						string_(),
					]),
				),
			).toStrictEqual([["foo", 123, false], undefined]);
		});
	});
});
