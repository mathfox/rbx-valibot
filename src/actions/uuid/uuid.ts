import type RegExp from "@rbxts/regexp";
import { UUID_REGEX } from "../../regex";
import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import { getGlobalConfig } from "../../storages";

/**
 * UUID issue type.
 */
export interface UuidIssue<TInput extends string> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "uuid";
	/**
	 * The expected property.
	 */
	readonly expected: undefined;
	/**
	 * The received property.
	 */
	readonly received: `"${string}"`;
	/**
	 * The UUID regex.
	 */
	readonly requirement: RegExp;
}

/**
 * UUID action type.
 */
export interface UuidAction<TInput extends string, TMessage extends ErrorMessage<UuidIssue<TInput>> | undefined>
	extends BaseValidation<TInput, TInput, UuidIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "uuid";
	/**
	 * The action reference.
	 */
	readonly reference: typeof uuid;
	/**
	 * The expected property.
	 */
	readonly expects: undefined;
	/**
	 * The UUID regex.
	 */
	readonly requirement: RegExp;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates an [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) validation action.
 *
 * @returns An UUID action.
 */
export function uuid<TInput extends string>(): UuidAction<TInput, undefined>;

/**
 * Creates an [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) validation action.
 *
 * @param message The error message.
 *
 * @returns An UUID action.
 */
export function uuid<TInput extends string, const TMessage extends ErrorMessage<UuidIssue<TInput>> | undefined>(
	message: TMessage,
): UuidAction<TInput, TMessage>;

export function uuid(
	message?: ErrorMessage<UuidIssue<string>>,
): UuidAction<string, ErrorMessage<UuidIssue<string>> | undefined> {
	return {
		kind: "validation",
		type: "uuid",
		reference: uuid,
		async: false,
		expects: undefined,
		requirement: UUID_REGEX,
		message,
		_run(dataset, config = getGlobalConfig()) {
			if (
				dataset.typed &&
				!(this as UuidAction<string, ErrorMessage<UuidIssue<string>> | undefined>).requirement.test(dataset.value)
			) {
				_addIssue(this, "UUID", dataset, config);
			}

			return dataset;
		},
	};
}
