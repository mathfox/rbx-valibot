import { describe, expect, test } from "@rbxts/jest-globals";
import { type ToMinValueAction, toMinValue } from "./toMinValue";
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from "@rbxts/number";

describe("toMinValue", () => {
	const action = toMinValue<number, 10>(10);

	test("should return action object", () => {
		expect(action).toStrictEqual({
			kind: "transformation",
			type: "to_min_value",
			reference: toMinValue,
			requirement: 10,
			async: false,
			_run: expect.any("function"),
		} satisfies ToMinValueAction<number, 10>);
	});

	test("should transform to min value", () => {
		const outputDataset = { typed: true, value: 10 };
		expect(action._run({ typed: true, value: 9 }, {})).toStrictEqual(outputDataset);
		expect(action._run({ typed: true, value: 0 }, {})).toStrictEqual(outputDataset);
		expect(action._run({ typed: true, value: MIN_SAFE_INTEGER }, {})).toStrictEqual(outputDataset);
	});

	test("should not transform value", () => {
		expect(action._run({ typed: true, value: 10 }, {})).toStrictEqual({
			typed: true,
			value: 10,
		});
		expect(action._run({ typed: true, value: 11 }, {})).toStrictEqual({
			typed: true,
			value: 11,
		});
		expect(action._run({ typed: true, value: MAX_SAFE_INTEGER }, {})).toStrictEqual({
			typed: true,
			value: MAX_SAFE_INTEGER,
		});
	});
});
