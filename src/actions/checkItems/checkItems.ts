import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import type { ArrayInput, ArrayRequirement } from "../types";

// TODO: Also add `checkItemsAsync` action

/**
 * Check items issue type.
 */
export interface CheckItemsIssue<TInput extends ArrayInput> extends BaseIssue<TInput[number]> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "check_items";
	/**
	 * The expected input.
	 */
	readonly expected: undefined;
	/**
	 * The validation function.
	 */
	readonly requirement: ArrayRequirement<TInput>;
}

/**
 * Check items action type.
 */
export interface CheckItemsAction<
	TInput extends ArrayInput,
	TMessage extends ErrorMessage<CheckItemsIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, CheckItemsIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "check_items";
	/**
	 * The action reference.
	 */
	readonly reference: typeof checkItems;
	/**
	 * The expected property.
	 */
	readonly expects: undefined;
	/**
	 * The validation function.
	 */
	readonly requirement: ArrayRequirement<TInput>;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates an check items validation action.
 *
 * @param requirement The validation function.
 *
 * @returns An check items action.
 */
export function checkItems<TInput extends ArrayInput>(
	requirement: ArrayRequirement<TInput>,
): CheckItemsAction<TInput, undefined>;

/**
 * Creates an check items validation action.
 *
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns An check items action.
 */
export function checkItems<
	TInput extends ArrayInput,
	const TMessage extends ErrorMessage<CheckItemsIssue<TInput>> | undefined,
>(requirement: ArrayRequirement<TInput>, message: TMessage): CheckItemsAction<TInput, TMessage>;

export function checkItems(
	requirement: ArrayRequirement<unknown[]>,
	message?: ErrorMessage<CheckItemsIssue<unknown[]>>,
): CheckItemsAction<unknown[], ErrorMessage<CheckItemsIssue<unknown[]>> | undefined> {
	return {
		kind: "validation",
		type: "check_items",
		reference: checkItems,
		async: false,
		expects: undefined,
		requirement,
		message,
		_run(dataset, config = getGlobalConfig()) {
			if (dataset.typed) {
				for (let index = 0; index < dataset.value.size(); index++) {
					const item = dataset.value[index];

					if (
						!(this as CheckItemsAction<unknown[], ErrorMessage<CheckItemsIssue<unknown[]>> | undefined>).requirement(
							item,
							index,
							dataset.value,
						)
					) {
						_addIssue(this, "item", dataset, config, {
							input: item,
						});
					}
				}
			}
			return dataset;
		},
	};
}
