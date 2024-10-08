import { describe, expect, test } from "@rbxts/jest-globals";
import { trim } from "../../actions";
import { string_ } from "../../schemas";
import { isOfKind } from "./isOfKind";

describe("isOfKind", () => {
	test("should check string schema", () => {
		const schema = string_();
		expect(isOfKind("schema", schema)).toBe(true);
		expect(isOfKind("validation" as any, schema)).toBe(false);
		expect(isOfKind("transformation" as any, schema)).toBe(false);
	});

	test("should check trim action", () => {
		const action = trim();
		expect(isOfKind("transformation", action)).toBe(true);
		expect(isOfKind("schema" as any, action)).toBe(false);
		expect(isOfKind("validation" as any, action)).toBe(false);
	});
});
