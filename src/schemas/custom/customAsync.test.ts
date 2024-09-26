import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { customAsync } from "./customAsync";
import type { CustomIssue } from "./types";

describe("customAsync", () => {
	const isEven = (input: unknown) => typeIs(input, "number") && input % 2 === 0;

	describe("should return dataset without issues", () => {
		const schema = customAsync(isEven);

		test("for numbers", async () => {
			await expectNoSchemaIssueAsync(schema, [2, 4, 10, 22]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = customAsync(isEven, "message");
		const baseIssue: Omit<CustomIssue, "input" | "received"> = {
			kind: "schema",
			type: "custom",
			expected: "unknown",
			message: "message",
		};

		// Primitive types

		test("for booleans", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [true, false]);
		});

		test("for numbers", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [-1, 1, 123, 45.67]);
		});

		test("for undefined", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [undefined]);
		});

		test("for strings", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, ["", "foo", "123"]);
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
});
