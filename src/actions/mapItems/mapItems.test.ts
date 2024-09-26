import { describe, expect, test } from "@rbxts/jest-globals";
import { mapItems } from "./mapItems";

describe("mapItems", () => {
	const operation = (item: number) => ({ item });
	const action = mapItems<number[], { item: number }>(operation);

	test("should transform input", () => {
		expect(action._run({ typed: true, value: [-12, 345, 0] }, {})).toEqual({
			typed: true,
			value: [{ item: -12 }, { item: 345 }, { item: 0 }],
		});
	});
});
