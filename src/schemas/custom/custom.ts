import type { BaseSchema, Dataset, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import type { CustomIssue } from "./types";

/**
 * Check type.
 */
type Check = (input: unknown) => boolean;

/**
 * Custom schema type.
 */
export interface CustomSchema<TInput, TMessage extends ErrorMessage<CustomIssue> | undefined>
	extends BaseSchema<TInput, TInput, CustomIssue> {
	/**
	 * The schema type.
	 */
	readonly type: "custom";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof custom;
	/**
	 * The expected property.
	 */
	readonly expects: "unknown";
	/**
	 * The type check function.
	 */
	readonly check: Check;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a custom schema.
 *
 * @param check The type check function.
 *
 * @returns A custom schema.
 */
export function custom<TInput>(check: Check): CustomSchema<TInput, undefined>;

/**
 * Creates a custom schema.
 *
 * @param check The type check function.
 * @param message The error message.
 *
 * @returns A custom schema.
 */
export function custom<
	TInput,
	const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined,
>(check: Check, message: TMessage): CustomSchema<TInput, TMessage>;

export function custom<TInput>(
	check: Check,
	message?: ErrorMessage<CustomIssue>,
): CustomSchema<TInput, ErrorMessage<CustomIssue> | undefined> {
	return {
		kind: "schema",
		type: "custom",
		reference: custom,
		expects: "unknown",
		async: false,
		check,
		message,
		_run(dataset, config) {
			// roblox-ts macro system requires manual cast
			if ((this as CustomSchema<TInput, ErrorMessage<CustomIssue> | undefined>).check(dataset.value)) {
				dataset.typed = true;
			} else {
				_addIssue(this, "type", dataset, config);
			}
			return dataset as Dataset<TInput, CustomIssue>;
		},
	};
}
