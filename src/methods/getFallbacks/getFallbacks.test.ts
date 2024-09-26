import { describe, expect, test } from "@rbxts/jest-globals";
import { boolean, number, object, strictObject, strictTuple, string_, tuple } from "../../schemas";
import { fallback } from "../fallback";
import { getFallbacks } from "./getFallbacks";

describe("getFallbacks", () => {
	test("should return undefined", () => {
		expect(getFallbacks(string_())).toBeUndefined();
		expect(getFallbacks(number())).toBeUndefined();
		expect(getFallbacks(boolean())).toBeUndefined();
	});

	test("should return default", () => {
		expect(getFallbacks(fallback(string_(), "foo" as const))).toBe("foo");
		expect(getFallbacks(fallback(number(), () => 123 as const))).toBe(123);
		expect(getFallbacks(fallback(boolean(), false as const))).toBe(false);
	});

	describe("should return object defaults", () => {
		test("for empty object", () => {
			expect(getFallbacks(object({}))).toEqual({});
		});

		test("for simple object", () => {
			expect(
				getFallbacks(
					object({
						key1: fallback(string_(), "foo" as const),
						key2: fallback(number(), () => 123 as const),
						key3: fallback(boolean(), false as const),
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

		test("for nested object", () => {
			expect(
				getFallbacks(
					object({
						nested: strictObject({
							key1: fallback(string_(), "foo" as const),
							key2: fallback(number(), () => 123 as const),
							key3: fallback(boolean(), false as const),
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
		test("for empty tuple", () => {
			expect(getFallbacks(tuple([]))).toEqual([]);
		});

		test("for simple tuple", () => {
			expect(
				getFallbacks(
					tuple([
						fallback(string_(), "foo" as const),
						fallback(number(), () => 123 as const),
						fallback(boolean(), false as const),
						string_(),
					]),
				),
			).toEqual(["foo", 123, false, undefined]);
		});

		test("for nested tuple", () => {
			expect(
				getFallbacks(
					tuple([
						strictTuple([
							fallback(string_(), "foo" as const),
							fallback(number(), () => 123 as const),
							fallback(boolean(), false as const),
						]),
						string_(),
					]),
				),
			).toEqual([["foo", 123, false], undefined]);
		});
	});
});
