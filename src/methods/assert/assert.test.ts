import { describe, expect, test } from "@rbxts/jest-globals";
import { transform } from "../../actions";
import { number, object, string_ } from "../../schemas";
import { pipe } from "../pipe";
import { assert_ } from "./assert";

describe("assert", () => {
	const entries = {
		key: pipe(
			string_(),
			transform((input) => input.size()),
		),
	};

	test("should not throw for valid input", () => {
		expect(() => assert_(string_(), "foo")).never.toThrowError();
		expect(() => assert_(number(), 123)).never.toThrowError();
		expect(() => assert_(object(entries), { key: "foo" })).never.toThrowError();
	});

	test("should throw for invalid input", () => {
		expect(() => assert_(string_(), 123)).toThrowError();
		expect(() => assert_(number(), "foo")).toThrowError();
		expect(() => assert_(object(entries), undefined)).toThrowError();
	});
});
