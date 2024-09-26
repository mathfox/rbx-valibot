import { describe, expect, test } from "@rbxts/jest-globals";
import { toMaxValue } from "./toMaxValue";
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from "@rbxts/phantom/src/Number";

describe("toMaxValue", () => {
	const action = toMaxValue<number, 10>(10);

	test("should transform to max value", () => {
		const outputDataset = { typed: true, value: 10 };
		expect(action._run({ typed: true, value: 10 }, {})).toStrictEqual(outputDataset);
		expect(action._run({ typed: true, value: 11 }, {})).toStrictEqual(outputDataset);
		expect(action._run({ typed: true, value: MAX_SAFE_INTEGER }, {})).toStrictEqual(outputDataset);
	});

	test("should not transform value", () => {
		expect(action._run({ typed: true, value: MIN_SAFE_INTEGER }, {})).toStrictEqual({
			typed: true,
			value: MIN_SAFE_INTEGER,
		});
		expect(action._run({ typed: true, value: 0 }, {})).toStrictEqual({
			typed: true,
			value: 0,
		});
		expect(action._run({ typed: true, value: 9 }, {})).toStrictEqual({
			typed: true,
			value: 9,
		});
	});
});
