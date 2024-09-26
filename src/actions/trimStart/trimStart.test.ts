import { describe, expect, test } from "@rbxts/jest-globals";
import { trimStart } from "./trimStart";

describe("trimStart", () => {
	describe("should trim start of string", () => {
		const action = trimStart();

		test("for empty string", () => {
			expect(action._run({ typed: true, value: "" }, {})).toEqual({
				typed: true,
				value: "",
			});
			expect(action._run({ typed: true, value: " " }, {})).toEqual({
				typed: true,
				value: "",
			});
		});

		test("with blanks at start", () => {
			expect(action._run({ typed: true, value: "  foo" }, {})).toEqual({
				typed: true,
				value: "foo",
			});
		});
	});

	test("should not trim end of string", () => {
		expect(trimStart()._run({ typed: true, value: "foo  " }, {})).toEqual({ typed: true, value: "foo  " });
	});
});
