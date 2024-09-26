import { describe, expect, test } from "@rbxts/jest-globals";
import { boolean, number, object, optional, strictObject, strictTuple, string_, tuple } from "../../schemas";
import { getDefaults } from "./getDefaults";

describe("getDefaults", () => {
	test("should return undefined", () => {
		expect(getDefaults(string_())).toBeUndefined();
		expect(getDefaults(number())).toBeUndefined();
		expect(getDefaults(boolean())).toBeUndefined();
	});

	test("should return default", () => {
		expect(getDefaults(optional(string_(), "foo"))).toBe("foo");
		expect(getDefaults(optional(number(), () => 123 as const))).toBe(123);
		expect(getDefaults(optional(boolean(), false))).toBe(false);
	});

	describe("should return object defaults", () => {
		test("for empty object", () => {
			expect(getDefaults(object({}))).toEqual({});
		});

		test("for simple object", () => {
			expect(
				getDefaults(
					object({
						key1: optional(string_(), "foo"),
						key2: optional(number(), () => 123 as const),
						key3: optional(boolean(), false),
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
				getDefaults(
					object({
						nested: strictObject({
							key1: optional(string_(), "foo"),
							key2: optional(number(), () => 123 as const),
							key3: optional(boolean(), false),
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
			expect(getDefaults(tuple([]))).toEqual([]);
		});

		test("for simple tuple", () => {
			expect(
				getDefaults(
					tuple([
						optional(string_(), "foo"),
						optional(number(), () => 123 as const),
						optional(boolean(), false),
						string_(),
					]),
				),
			).toEqual(["foo", 123, false, undefined]);
		});

		test("for nested tuple", () => {
			expect(
				getDefaults(
					tuple([
						strictTuple([
							optional(string_(), "foo"),
							optional(number(), () => 123 as const),
							optional(boolean(), false),
						]),
						string_(),
					]),
				),
			).toEqual([["foo", 123, false], undefined]);
		});
	});
});
