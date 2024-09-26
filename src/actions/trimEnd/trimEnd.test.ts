import { describe, expect, test } from "@rbxts/jest-globals";
import { trimEnd } from "./trimEnd";

describe("trimEnd", () => {
	describe("should trim end of string", () => {
		const action = trimEnd();

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

		test("with blanks at end", () => {
			expect(action._run({ typed: true, value: "foo  " }, {})).toEqual({
				typed: true,
				value: "foo",
			});
		});
	});

	test("should not trim start of string", () => {
		expect(trimEnd()._run({ typed: true, value: "  foo" }, {})).toEqual({
			typed: true,
			value: "  foo",
		});
	});
});
