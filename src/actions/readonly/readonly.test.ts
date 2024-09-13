import { describe, expect, test } from "@rbxts/jest-globals";
import { type ReadonlyAction, readonly } from "./readonly";

describe("readonly", () => {
	test("should return action object", () => {
		expect(readonly()).toStrictEqual({
			kind: "transformation",
			type: "readonly",
			reference: readonly,
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		} satisfies ReadonlyAction<{ key: string }>);
	});

	test("should return same dataset", () => {
		const dataset = { typed: true, value: { key: "foo" } } as const;
		expect(readonly()._run(dataset, {})).toStrictEqual(dataset);
	});
});
