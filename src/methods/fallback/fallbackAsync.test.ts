import { describe, expect, test } from "@rbxts/jest-globals";
import { transformAsync } from "../../actions";
import { boolean, number, union } from "../../schemas";
import { pipeAsync } from "../pipe";
import { fallbackAsync } from "./fallbackAsync";

describe("fallbackAsync", () => {
	const schema = fallbackAsync(
		pipeAsync(
			union([number(), boolean()]),
			transformAsync(async (input) => tostring(input)),
		),
		async () => "123",
	);

	describe("should return default dataset", () => {
		test("for valid input", async () => {
			expect(await schema._run({ typed: false, value: 789 }, {})).toStrictEqual({
				typed: true,
				value: "789",
			});
		});
	});

	describe("should return dataset with fallback", () => {
		test("for invalid input", async () => {
			expect(await schema._run({ typed: false, value: "foo" }, {})).toStrictEqual({
				typed: true,
				value: "123",
			});
		});
	});
});
