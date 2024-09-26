import { describe, expect, test } from "@rbxts/jest-globals";
import { findItem } from "./findItem";

describe("findItem", () => {
	const operation = (item: number) => item > 9;
	const action = findItem<number[]>(operation);

	describe("should transform input", () => {
		test("to searched item", () => {
			expect(action._run({ typed: true, value: [-12, 9, 345, 10, 0, 999] }, {})).toStrictEqual({
				typed: true,
				value: 345,
			});
		});

		test("to undefined", () => {
			expect(action._run({ typed: true, value: [-12, 9, 0] }, {})).toStrictEqual({
				typed: true,
				value: undefined,
			});
		});
	});
});
