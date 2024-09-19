/**
 * Joins multiple `expects` values with the given separator.
 *
 * @param values The `expects` values.
 * @param separator The separator.
 *
 * @returns The joined `expects` property.
 *
 * @internal
 */
export function _joinExpects(values: string[], separator: "&" | "|"): string {
	let uniqueValuesCount = 0;
	const metValues = new Set<string>();
	const uniqueValues = new Array<string>();

	// Create list without duplicates
	for (const value of values) {
		if (metValues.has(value)) continue;
		metValues.add(value);

		uniqueValuesCount += 1;
		uniqueValues.push(value);
	}

	// If list has more than one item, join them
	if (uniqueValues.size() > 1) {
		return `(${uniqueValues.join(` ${separator} `)})`;
	}

	// Otherwise, return first item or "never"
	return uniqueValues[0] ?? "never";
}
