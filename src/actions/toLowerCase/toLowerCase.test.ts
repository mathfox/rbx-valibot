import { describe, expect, test } from "@rbxts/jest-globals";
import { toLowerCase } from "./toLowerCase";

describe("toLowerCase", () => {
	describe("should lower case string", () => {
		const action = toLowerCase();

		test("for string", () => {
			expect(action._run({ typed: true, value: " TeSt123 " }, {})).toEqual({
				typed: true,
				value: " test123 ",
			});
		});
	});
});
