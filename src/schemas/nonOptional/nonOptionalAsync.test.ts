import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssueAsync, expectSchemaIssueAsync } from "../../tests";
import { string_ } from "../string";
import { nonOptionalAsync } from "./nonOptionalAsync";
import type { NonOptionalIssue } from "./types";
import { optionalAsync } from "../optional";

describe("nonOptionalAsync", () => {
	describe("should return dataset without issues", () => {
		const schema = nonOptionalAsync(optionalAsync(string_()));

		test("for valid wrapped types", async () => {
			await expectNoSchemaIssueAsync(schema, ["", "foo", "#$%"]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = nonOptionalAsync(optionalAsync(string_()), "message");
		const baseIssue: Omit<NonOptionalIssue, "input" | "received"> = {
			kind: "schema",
			type: "non_optional",
			expected: "!undefined",
			message: "message",
		};

		test("for undefined", async () => {
			await expectSchemaIssueAsync(schema, baseIssue, [undefined]);
		});
	});
});
