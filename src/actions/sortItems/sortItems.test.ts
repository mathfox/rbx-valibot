import { describe, expect, test } from "@rbxts/jest-globals";
import { sortItems } from "./sortItems";

describe("sortItems", () => {
	const operation = (itemA: number, itemB: number) => itemA < itemB;
	const action = sortItems<number[]>(operation);

	test("should transform input", () => {
		expect(action._run({ typed: true, value: [9, -12, 345, 0, 999] }, {})).toEqual({
			typed: true,
			value: [-12, 0, 9, 345, 999],
		});
	});
});
