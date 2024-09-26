import { describe, expect, test } from "@rbxts/jest-globals";
import { filterItems } from "./filterItems";

describe("filterItems", () => {
	const operation = (item: number) => item > 9;
	const action = filterItems<number[]>(operation);

	test("should transform input", () => {
		expect(action._run({ typed: true, value: [-12, 345, 0, 9, 10, 999] }, {})).toEqual({
			typed: true,
			value: [345, 10, 999],
		});
	});
});
