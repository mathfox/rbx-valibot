import { describe, expect, test, vi } from "vitest";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../vitest/index.ts";
import { type StringIssue, type StringSchema, string } from "../string/index.ts";
import { type LazySchema, lazy } from "./lazy.ts";

describe("lazy", () => {
	test("should return schema object", () => {
		const getter = () => string();
		expect(lazy(getter)).toStrictEqual({
			kind: "schema",
			type: "lazy",
			reference: lazy,
			expects: "unknown",
			getter,
			async: false,
			_run: expect.any(Function),
		} satisfies LazySchema<StringSchema<undefined>>);
	});

	describe("should return dataset without issues", () => {
		const schema = lazy(() => string());

		test("for strings", () => {
			expectNoSchemaIssue(schema, ["", "foo", "123"]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = lazy(() => string("message"));
		const baseIssue: Omit<StringIssue, "input" | "received"> = {
			kind: "schema",
			type: "string",
			expected: "string",
			message: "message",
		};

		// Primitive types

		test("for bigints", () => {
			expectSchemaIssue(schema, baseIssue, [-1n, 0n, 123n]);
		});

		test("for booleans", () => {
			expectSchemaIssue(schema, baseIssue, [true, false]);
		});

		test("for null", () => {
			expectSchemaIssue(schema, baseIssue, [null]);
		});

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for undefined", () => {
			expectSchemaIssue(schema, baseIssue, [undefined]);
		});

		test("for symbols", () => {
			expectSchemaIssue(schema, baseIssue, [Symbol(), Symbol("foo")]);
		});

		// Complex types

		test("for arrays", () => {
			expectSchemaIssue(schema, baseIssue, [[], ["value"]]);
		});

		test("for functions", () => {
			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
		});

		test("for objects", () => {
			expectSchemaIssue(schema, baseIssue, [{}, { key: "value" }]);
		});
	});

	test("should call getter with input", () => {
		const getter = vi.fn(() => string());
		const dataset = { typed: false, value: "foo" };
		lazy(getter)._run(dataset, {});
		expect(getter).toHaveBeenCalledWith(dataset.value);
	});
});
