import { describe, expect, test } from "@rbxts/jest-globals";
import { nonOptional, nonOptionalAsync, optional, optionalAsync, string_ } from "../../schemas";
import { unwrap } from "./unwrap";

describe("unwrap", () => {
	const wrapped = string_();

	test("should unwrap nonOptional", () => {
		expect(unwrap(nonOptional(wrapped))).toBe(wrapped);
	});

	test("should unwrap nonOptionalAsync", () => {
		expect(unwrap(nonOptionalAsync(wrapped))).toBe(wrapped);
	});

	test("should unwrap optional", () => {
		expect(unwrap(optional(wrapped))).toBe(wrapped);
	});

	test("should unwrap optionalAsync", () => {
		expect(unwrap(optionalAsync(wrapped))).toBe(wrapped);
	});
});
