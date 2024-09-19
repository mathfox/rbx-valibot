import { describe, expect, test } from "@rbxts/jest-globals";
import { trim } from "./trim";

describe("trim", () => {
	describe("should trim string", () => {
		const action = trim();

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

		test("with blanks at end", () => {
			expect(action._run({ typed: true, value: "foo  " }, {})).toEqual({
				typed: true,
				value: "foo",
			});
		});

		test("with blanks at start and end", () => {
			expect(action._run({ typed: true, value: "  foo  " }, {})).toEqual({
				typed: true,
				value: "foo",
			});
		});
	});
});
