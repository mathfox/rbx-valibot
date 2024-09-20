import { describe, expect, test } from "@rbxts/jest-globals";
import { awaitAsync } from "./awaitAsync";

describe("awaitAsync", () => {
	type Input = Promise<string>;
	const action = awaitAsync<Input>();

	test("should await promise", async () => {
		expect(await action._run({ typed: true, value: Promise.resolve("foo") }, {})).toEqual({
			typed: true,
			value: "foo",
		});
	});
});
