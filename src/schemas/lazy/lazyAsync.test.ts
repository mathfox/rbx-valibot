import { describe, expect, jest, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { type StringIssue, string_ } from "../string";
import { lazyAsync } from "./lazyAsync";

describe("lazyAsync", () => {
	describe("should return dataset without issues", () => {
		const schema = lazyAsync(() => string_());

		test("for strings", async () => {
			await expectNoSchemaIssueAsync(schema, ["", "foo", "123"]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = lazyAsync(() => string_("message"));
		const baseIssue: Omit<StringIssue, "input" | "received"> = {
			kind: "schema",
			type: "string",
			expected: "string",
			message: "message",
		};

		// Primitive types

		test("for booleans", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [true, false]);
		});

		test("for numbers", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for undefined", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [undefined]);
		});

		// Complex types

		test("for arrays", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [[], ["value"]]);
		});

		test("for functions", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [() => {}, function () {}]);
		});

		test("for objects", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [{}, { key: "value" }]);
		});
	});

	test("should call getter with input", () => {
		const getter = jest.fn(() => string_());
		const dataset = { typed: false, value: "foo" } as const;
		lazyAsync(getter)._run(dataset, {});
		expect(getter).toHaveBeenCalledWith(dataset.value);
	});
});
