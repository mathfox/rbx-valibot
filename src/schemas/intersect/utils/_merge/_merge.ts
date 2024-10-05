import isArray from "@rbxts/phantom/src/Array/isArray";

/**
 * Merge dataset type.
 */
type MergeDataset = { value: unknown; issue?: undefined } | { value?: undefined; issue: true };

/**
 * Merges two values into one single output.
 *
 * @param value1 First value.
 * @param value2 Second value.
 *
 * @returns The merge dataset.
 *
 * @internal
 */
export function _merge(value1: unknown, value2: unknown): MergeDataset {
	// Continue if data type of values match
	if (typeOf(value1) === typeOf(value2)) {
		// Return first value if both are equal
		if (value1 === value2) {
			return { value: value1 };
		}

		// Return deeply merged array
		if (isArray(value1) && isArray(value2)) {
			// Continue if arrays have same length
			if (value1.size() === value2.size()) {
				// Merge item of `value2` into `value1`
				for (let index = 0; index < value1.size(); index++) {
					const dataset = _merge(value1[index], value2[index]);

					// If dataset has issue, return it
					if (dataset.issue) {
						return dataset;
					}

					// Otherwise, replace merged items
					(value1 as unknown[])[index] = dataset.value;
				}

				// Return deeply merged array
				return { value: value1 };
			}

			return { issue: true };
		}
	}

	// Return deeply merged object
	if (typeIs(value1, "table") && typeIs(value2, "table")) {
		// Deeply merge entries of `value2` into `value1`
		for (const [key] of value2 as Map<string, unknown>) {
			if (key in value1) {
				const dataset = _merge((value1 as Record<string, unknown>)[key], (value2 as Record<string, unknown>)[key]);

				// If dataset has issue, return it
				if (dataset.issue) {
					return dataset;
				}

				// Otherwise, replace merged entry
				(value1 as Record<string, unknown>)[key] = dataset.value;

				// Otherwise, just add entry
			} else {
				(value1 as Record<string, unknown>)[key] = (value2 as Record<string, unknown>)[key];
			}
		}

		// Return deeply merged object
		return { value: value1 };
	}

	// Otherwise, return that values can't be merged
	return { issue: true };
}
