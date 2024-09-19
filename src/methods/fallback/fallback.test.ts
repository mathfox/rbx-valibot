import { describe, expect, test } from "@rbxts/jest-globals";
import { transform } from "../../actions";
import { boolean, number, union } from "../../schemas";
import { pipe } from "../pipe";
import { fallback } from "./fallback";

describe("fallback", () => {
	const schema = fallback(
		pipe(
			union([number(), boolean()]),
			transform((value) => tostring(value)),
		),
		"123",
	);

	describe("should return default dataset", () => {
		test("for valid input", () => {
			expect(schema._run({ typed: false, value: 789 }, {})).toEqual({
				typed: true,
				value: "789",
			});
		});
	});

	describe("should return dataset with fallback", () => {
		test("for invalid input", () => {
			expect(schema._run({ typed: false, value: "foo" }, {})).toEqual({
				typed: true,
				value: "123",
			});
		});
	});
});
