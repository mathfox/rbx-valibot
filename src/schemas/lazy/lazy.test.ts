import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type StringIssue, type StringSchema, string } from "../string";
import { type LazySchema, lazy } from "./lazy";

describe("lazy", () => {
	//	test("should return schema object", () => {
	//		const getter = () => string();
	//		expect(lazy(getter)).toStrictEqual({
	//			kind: "schema",
	//			type: "lazy",
	//			reference: lazy,
	//			expects: "unknown",
	//			getter,
	//			async: false,
	//			_run: expect.any(Function),
	//		} satisfies LazySchema<StringSchema<undefined>>);
	//	});
	//
	//	describe("should return dataset without issues", () => {
	//		const schema = lazy(() => string());
	//
	//		test("for strings", () => {
	//			expectNoSchemaIssue(schema, ["", "foo", "123"]);
	//		});
	//	});
	//
	//	describe("should return dataset with issues", () => {
	//		const schema = lazy(() => string("message"));
	//		const baseIssue: Omit<StringIssue, "input" | "received"> = {
	//			kind: "schema",
	//			type: "string",
	//			expected: "string",
	//			message: "message",
	//		};
	//
	//		// Primitive types
	//
	//		test("for booleans", () => {
	//			expectSchemaIssue(schema, baseIssue, [true, false]);
	//		});
	//
	//		test("for numbers", () => {
	//			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
	//		});
	//
	//		test("for undefined", () => {
	//			expectSchemaIssue(schema, baseIssue, [undefined]);
	//		});
	//
	//		// Complex types
	//
	//		test("for arrays", () => {
	//			expectSchemaIssue(schema, baseIssue, [[], ["value"]]);
	//		});
	//
	//		test("for functions", () => {
	//			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
	//		});
	//
	//		test("for objects", () => {
	//			expectSchemaIssue(schema, baseIssue, [{}, { key: "value" }]);
	//		});
	//	});
	//
	//	test("should call getter with input", () => {
	//		const getter = vi.fn(() => string());
	//		const dataset = { typed: false, value: "foo" };
	//		lazy(getter)._run(dataset, {});
	//		expect(getter).toHaveBeenCalledWith(dataset.value);
	//	});
});
