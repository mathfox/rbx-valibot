import { describe, expect, test } from "@rbxts/jest-globals";
import { type DescriptionAction, description } from "./description";

describe("description", () => {
	test("should return action object", () => {
		expect(description<string, "text">("text")).toStrictEqual({
			kind: "metadata",
			type: "description",
			reference: description,
			description: "text",
		} satisfies DescriptionAction<string, "text">);
	});
});
