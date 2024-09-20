import { describe, expect, test } from "@rbxts/jest-globals";
import { toUpperCase } from "./toUpperCase";

describe("toUpperCase", () => {
	describe("should upper case string", () => {
		const action = toUpperCase();

		test("for string", () => {
			expect(action._run({ typed: true, value: " TeSt123 " }, {})).toEqual({
				typed: true,
				value: " TEST123 ",
			});
		});
	});
});
