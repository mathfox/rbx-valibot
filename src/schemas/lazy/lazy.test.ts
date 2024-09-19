import { describe, expect, jest, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type StringIssue, string_ } from "../string";
import { lazy } from "./lazy";

describe("lazy", () => {
	describe("should return dataset without issues", () => {
		const schema = lazy(() => string_());

		test("for strings", () => {
			expectNoSchemaIssue(schema, ["", "foo", "123"]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = lazy(() => string_("message"));
		const baseIssue: Omit<StringIssue, "input" | "received"> = {
			kind: "schema",
			type: "string",
			expected: "string",
			message: "message",
		};

		// Primitive types

		test("for booleans", () => {
			expectSchemaIssue(schema, baseIssue, [true, false]);
		});

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for undefined", () => {
			expectSchemaIssue(schema, baseIssue, [undefined]);
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
		const getter = jest.fn(() => string_());
		const dataset = { typed: false, value: "foo" };
		lazy(getter)._run(dataset, {});
		expect(getter).toHaveBeenCalledWith(dataset.value);
	});
});
