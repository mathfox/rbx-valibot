import { describe, expect, test } from "@rbxts/jest-globals";
import { toMinValue } from "./toMinValue";
import { MIN_SAFE_INTEGER, MAX_SAFE_INTEGER } from "@rbxts/phantom/src/Number";

describe("toMinValue", () => {
	const action = toMinValue<number, 10>(10);

	test("should transform to min value", () => {
		const outputDataset = { typed: true, value: 10 };
		expect(action._run({ typed: true, value: 9 }, {})).toEqual(outputDataset);
		expect(action._run({ typed: true, value: 0 }, {})).toEqual(outputDataset);
		expect(action._run({ typed: true, value: MIN_SAFE_INTEGER }, {})).toEqual(outputDataset);
	});

	test("should not transform value", () => {
		expect(action._run({ typed: true, value: 10 }, {})).toEqual({
			typed: true,
			value: 10,
		});
		expect(action._run({ typed: true, value: 11 }, {})).toEqual({
			typed: true,
			value: 11,
		});
		expect(action._run({ typed: true, value: MAX_SAFE_INTEGER }, {})).toEqual({
			typed: true,
			value: MAX_SAFE_INTEGER,
		});
	});
});
