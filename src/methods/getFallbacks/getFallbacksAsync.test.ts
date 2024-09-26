import { describe, expect, test } from "@rbxts/jest-globals";
import {
	boolean,
	number,
	object,
	objectAsync,
	strictObjectAsync,
	strictTupleAsync,
	string_,
	tuple,
	tupleAsync,
} from "../../schemas";
import { fallback, fallbackAsync } from "../fallback";
import { getFallbacksAsync } from "./getFallbacksAsync";

describe("await getFallbacksAsync", () => {
	test("should return undefined", async () => {
		expect(await getFallbacksAsync(string_())).toBeUndefined();
		expect(await getFallbacksAsync(number())).toBeUndefined();
		expect(await getFallbacksAsync(boolean())).toBeUndefined();
	});

	test("should return default", async () => {
		expect(await getFallbacksAsync(fallback(string_(), "foo" as const))).toBe("foo");
		expect(await getFallbacksAsync(fallback(number(), () => 123 as const))).toBe(123);
		expect(await getFallbacksAsync(fallbackAsync(boolean(), async () => false as const))).toBe(false);
	});

	describe("should return object defaults", () => {
		test("for empty object", async () => {
			expect(await getFallbacksAsync(object({}))).toEqual({});
		});

		test("for simple object", async () => {
			expect(
				await getFallbacksAsync(
					objectAsync({
						key1: fallback(string_(), "foo" as const),
						key2: fallback(number(), () => 123 as const),
						key3: fallbackAsync(boolean(), false as const),
						key4: string_(),
					}),
				),
			).toEqual({
				key1: "foo",
				key2: 123,
				key3: false,
				key4: undefined,
			});
		});

		test("for nested object", async () => {
			expect(
				await getFallbacksAsync(
					objectAsync({
						nested: strictObjectAsync({
							key1: fallback(string_(), "foo" as const),
							key2: fallback(number(), () => 123 as const),
							key3: fallbackAsync(boolean(), false as const),
						}),
						other: string_(),
					}),
				),
			).toEqual({
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
			expect(await getFallbacksAsync(tuple([]))).toEqual([]);
		});

		test("for simple tuple", async () => {
			expect(
				await getFallbacksAsync(
					tupleAsync([
						fallback(string_(), "foo" as const),
						fallback(number(), () => 123 as const),
						fallbackAsync(boolean(), false as const),
						string_(),
					]),
				),
			).toEqual(["foo", 123, false, undefined]);
		});

		test("for nested tuple", async () => {
			expect(
				await getFallbacksAsync(
					tupleAsync([
						strictTupleAsync([
							fallback(string_(), "foo" as const),
							fallback(number(), () => 123 as const),
							fallbackAsync(boolean(), false as const),
						]),
						string_(),
					]),
				),
			).toEqual([["foo", 123, false], undefined]);
		});
	});
});
