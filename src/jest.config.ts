import type { Config } from "@rbxts/jest";

export = identity<Config>({
	testMatch: ["**/*object*.test", "**/*Object*.test"],
});
