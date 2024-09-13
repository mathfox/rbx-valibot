import { describe, expect, test } from "@rbxts/jest-globals";
import { type BrandAction, brand } from "./brand.ts";

describe("brand", () => {
	//test("should return action object", () => {
	//	expect(brand("foo")).toStrictEqual({
	//		kind: "transformation",
	//		type: "brand",
	//		reference: brand,
	//		name: "foo",
	//		async: false,
	//		_run: expect.any(Function),
	//	} satisfies BrandAction<string, "foo">);
	//});

	test("should return same dataset", () => {
		const dataset = { typed: true, value: "foo" } as const;
		expect(brand("foo")._run(dataset, {})).toStrictEqual(dataset);
	});
});
