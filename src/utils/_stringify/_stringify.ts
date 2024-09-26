/**
 * Stringifies an unknown input to a literal or type string.
 *
 * @param input The unknown input.
 *
 * @returns A literal or type string.
 *
 * @internal
 */
export function _stringify(input: unknown): string {
	if (typeIs(input, "string")) {
		return `"${input}"`;
	}

	return tostring(input);
}
