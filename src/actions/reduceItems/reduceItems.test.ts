import { describe, expect, test } from "@rbxts/jest-globals";
import { reduceItems } from "./reduceItems";

describe("reduceItems", () => {
	const operation = (output: number, item: number) => output + item;
	const initial = 0;
	const action = reduceItems<number[], number>(operation, initial);

	test("should transform input", () => {
		expect(action._run({ typed: true, value: [9, -12, 345, 0, 999] }, {})).toEqual({
			typed: true,
			value: 1341,
		});
	});
});
