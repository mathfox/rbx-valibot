import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseSchema, ErrorMessage, OutputDataset } from "../../types";
import { _addIssue } from "../../utils";

/**
 * String issue type.
 */
export interface StringIssue extends BaseIssue<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "string";
	/**
	 * The expected property.
	 */
	readonly expected: "string";
}

/**
 * String schema type.
 */
export interface StringSchema<TMessage extends ErrorMessage<StringIssue> | undefined>
	extends BaseSchema<string, string, StringIssue> {
	/**
	 * The schema type.
	 */
	readonly type: "string";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof string_;
	/**
	 * The expected property.
	 */
	readonly expects: "string";
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a string schema.
 *
 * @returns A string schema.
 */
export function string_(): StringSchema<undefined>;

/**
 * Creates a string schema.
 *
 * @param message The error message.
 *
 * @returns A string schema.
 */
export function string_<const TMessage extends ErrorMessage<StringIssue> | undefined>(
	message: TMessage,
): StringSchema<TMessage>;

export function string_(message?: ErrorMessage<StringIssue>): StringSchema<ErrorMessage<StringIssue> | undefined> {
	return {
		kind: "schema",
		type: "string",
		reference: string_,
		expects: "string",
		async: false,
		message,
		_run(dataset, config = getGlobalConfig()) {
			if (typeIs(dataset.value, "string")) {
				dataset.typed = true;
			} else {
				_addIssue(this, "type", dataset, config);
			}

			return dataset as OutputDataset<string, StringIssue>;
		},
	};
}
