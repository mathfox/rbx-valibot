import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type NonEmptyAction, type NonEmptyIssue, nonEmpty } from "./nonEmpty";

describe("nonEmpty", () => {
	describe("should return action object", () => {
		const baseAction: Omit<NonEmptyAction<string, never>, "message"> = {
			kind: "validation",
			type: "non_empty",
			reference: nonEmpty,
			expects: "!0",
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		};

		test("with undefined message", () => {
			const action: NonEmptyAction<string, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(nonEmpty()).toStrictEqual(action);
			expect(nonEmpty(undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(nonEmpty("message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies NonEmptyAction<string, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(nonEmpty(message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies NonEmptyAction<string, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = nonEmpty();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, [" ", "\n", "foo", "foobarbaz123"]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [[undefined], [1, 2, 3, 4, 6], new Array(999)]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = nonEmpty("message");
		const baseIssue: Omit<NonEmptyIssue<string>, "input" | "received"> = {
			kind: "validation",
			type: "non_empty",
			expected: "!0",
			message: "message",
		};

		test("for invalid strings", () => {
			expectActionIssue(action, baseIssue, [""], () => "0");
		});

		test("for invalid arrays", () => {
			expectActionIssue(action, baseIssue, [[]], () => "0");
		});
	});
});
