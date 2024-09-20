import RegExp from "@rbxts/regexp";

/**
 * [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) regex.
 */
export const UUID_REGEX = RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", "m");
