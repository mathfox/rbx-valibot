import { describe, expect, test } from "@rbxts/jest-globals";
import type { MinLengthIssue } from "../../actions";
import { ValiError } from "./ValiError";

describe("ValiError", () => {
	test("should create error instance", () => {
		const minLengthIssue: MinLengthIssue<string, 10> = {
			kind: "validation",
			type: "min_length",
			input: "foo",
			expected: ">=10",
			received: "3",
			message: "Invalid length: Expected >=10 but received 3",
			requirement: 10,
		};

		const err = new ValiError([minLengthIssue]);
		expect(err).toBeInstanceOf(ValiError);
		expect(err.name).toBe("ValiError");
		expect(err.message).toBe(minLengthIssue.message);
		expect(err.issues).toEqual([minLengthIssue]);
	});
});
