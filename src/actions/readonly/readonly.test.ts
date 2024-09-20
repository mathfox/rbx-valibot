import { describe, expect, test } from "@rbxts/jest-globals";
import { readonly } from "./readonly";

describe("readonly", () => {
	test("should return same dataset", () => {
		const dataset = { typed: true, value: { key: "foo" } } as const;
		expect(readonly()._run(dataset, {})).toEqual(dataset);
	});
});
