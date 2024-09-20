import { describe, expect, test } from "@rbxts/jest-globals";
import { EMAIL_REGEX } from "../../regex";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type EmailIssue, email } from "./email";

describe("email", () => {
	describe("should return dataset without issues", () => {
		const action = email();

		// General tests

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for simple email", () => {
			expectNoActionIssue(action, ["email@example.com"]);
		});

		test("for very short email", () => {
			expectNoActionIssue(action, ["a@b.cd"]);
		});

		// Start of local part

		test("for underscore in begining of local part", () => {
			expectNoActionIssue(action, ["_email@example.com"]);
		});

		test("for hyphen in begining of local part", () => {
			expectNoActionIssue(action, ["-email@example.com"]);
		});

		test("for plus in begining of local part", () => {
			expectNoActionIssue(action, ["+email@example.com"]);
		});

		// End of local part

		test("for underscore in end of local part", () => {
			expectNoActionIssue(action, ["email_@example.com"]);
		});

		test("for hyphen in end of local part", () => {
			expectNoActionIssue(action, ["email-@example.com"]);
		});

		test("for plus in end of local part", () => {
			expectNoActionIssue(action, ["email+@example.com"]);
		});

		// Middle of local part

		test("for dot in local part", () => {
			expectNoActionIssue(action, ["firstname.lastname@example.com"]);
		});

		test("for underscore in local part", () => {
			expectNoActionIssue(action, ["firstname_lastname@example.com"]);
		});

		test("for hyphen in local part", () => {
			expectNoActionIssue(action, ["firstname-lastname@example.com"]);
		});

		test("for plus in local part", () => {
			expectNoActionIssue(action, ["firstname+lastname@example.com"]);
		});

		// Special local parts

		test("for numerical local part", () => {
			expectNoActionIssue(action, ["1234567890@example.com"]);
		});

		test("for underscore local part", () => {
			expectNoActionIssue(action, ["_______@example.com"]);
		});

		// Domain part variations

		test("for hyphen in domain part", () => {
			expectNoActionIssue(action, ["email@example-domain.com"]);
		});

		test("for domain with subdomain", () => {
			expectNoActionIssue(action, ["email@subdomain.example.com"]);
		});

		test("for subdomain and hyphen in domain", () => {
			expectNoActionIssue(action, ["email@subdomain.example-domain.com"]);
		});

		test("for long top level domain", () => {
			expectNoActionIssue(action, ["email@example.technology"]);
		});

		test("for country code TLD", () => {
			expectNoActionIssue(action, ["email@example.co.uk"]);
		});

		test("for subdomain and country code TDL", () => {
			expectNoActionIssue(action, ["email@subdomain.example.co.uk"]);
		});

		test("for numerical domain", () => {
			expectNoActionIssue(action, ["email@123.com"]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = email("message");
		const baseIssue: Omit<EmailIssue<string>, "input" | "received"> = {
			kind: "validation",
			type: "email",
			expected: undefined,
			message: "message",
			requirement: EMAIL_REGEX,
		};

		// General tests

		test("for empty strings", () => {
			expectActionIssue(action, baseIssue, ["", " ", "\n"]);
		});

		test("for simple strings", () => {
			expectActionIssue(action, baseIssue, ["email", "emailexamplecom"]);
		});

		test("for email with spaces", () => {
			expectActionIssue(action, baseIssue, [
				" email@example.com",
				"e mail@example.com",
				"email @example.com",
				"email@ example.com",
				"email@exa mple.com",
				"email@example. com",
				"email@example.com ",
			]);
		});

		// Missing parts

		test("for missing local part", () => {
			expectActionIssue(action, baseIssue, ["@example.com"]);
		});

		test("for missing @ symbol", () => {
			expectActionIssue(action, baseIssue, ["example.com", "email.example.com"]);
		});

		test("for missing domain part", () => {
			expectActionIssue(action, baseIssue, ["email@"]);
		});

		test("for missing domain name", () => {
			expectActionIssue(action, baseIssue, ["email@.com"]);
		});

		test("for missing TLD", () => {
			expectActionIssue(action, baseIssue, ["email@example"]);
		});

		// Invalid repeated chars

		test("for two following dots in local part", () => {
			expectActionIssue(action, baseIssue, ["email..email@example.com"]);
		});

		test("for two following @ symbols", () => {
			expectActionIssue(action, baseIssue, ["email@@example.com"]);
		});

		test("for dot in end of domain name", () => {
			expectActionIssue(action, baseIssue, ["email@example..com"]);
		});

		// Beginning and end of local part

		test("for dot in beginning of local part", () => {
			expectActionIssue(action, baseIssue, [".email@example.com"]);
		});

		test("for dot in end of local part", () => {
			expectActionIssue(action, baseIssue, ["email.@example.com"]);
		});

		// Beginning and end of domain part

		test("for underscore in beginning of domain part", () => {
			expectActionIssue(action, baseIssue, ["email@_example.com"]);
		});

		test("for hypen in beginning of domain part", () => {
			expectActionIssue(action, baseIssue, ["email@-example.com"]);
		});

		test("for plus in beginning of domain part", () => {
			expectActionIssue(action, baseIssue, ["email@+example.com"]);
		});

		test("for dot in beginning of domain part", () => {
			expectActionIssue(action, baseIssue, ["email@.example.com"]);
		});

		test("for underscore in end of domain name", () => {
			expectActionIssue(action, baseIssue, ["email@example_.com"]);
		});

		test("for hypen in end of domain name", () => {
			expectActionIssue(action, baseIssue, ["email@example-.com"]);
		});

		test("for plus in end of domain name", () => {
			expectActionIssue(action, baseIssue, ["email@example+.com"]);
		});

		test("for numerical TLD", () => {
			expectActionIssue(action, baseIssue, ["email@example.123"]);
		});

		test("for single char TLD", () => {
			expectActionIssue(action, baseIssue, ["email@example.a"]);
		});

		// Other special cases

		test("for repeated domain part", () => {
			expectActionIssue(action, baseIssue, ["email@example@example.com"]);
		});

		test("for special chars", () => {
			expectActionIssue(action, baseIssue, ["#$&%@example.com", "email@#$&%.com", "email@example.#$&%"]);
		});

		test("for non ASCII chars", () => {
			expectActionIssue(action, baseIssue, ["あいうえお@example.com", "email@あいうえお.com", "email@example.あいう"]);
		});

		test("for email username", () => {
			expectActionIssue(action, baseIssue, ["Joe Smith <email@example.com>", "email@example.com (Joe Smith)"]);
		});
	});
});
