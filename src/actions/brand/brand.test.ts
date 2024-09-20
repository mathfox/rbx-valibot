import { describe, expect, test } from "@rbxts/jest-globals";
import { brand } from "./brand";

describe("brand", () => {
	test("should return same dataset", () => {
		const dataset = { typed: true, value: "foo" } as const;
		expect(brand("foo")._run(dataset, {})).toEqual(dataset);
	});
});
