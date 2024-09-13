import { describe, expect, test } from "@rbxts/jest-globals";
import type { MinLengthIssue } from "../../actions/index.ts";
import { ValiError } from "./ValiError.ts";

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

		const error = new ValiError([minLengthIssue]);
		expect(error).toBeInstanceOf(ValiError);
		expect(error.name).toBe("ValiError");
		expect(error.message).toBe(minLengthIssue.message);
		expect(error.issues).toEqual([minLengthIssue]);
	});
});
