import type { BaseIssue, BaseValidation, ErrorMessage, MaybeReadonly } from "../../types";
import { _addIssue } from "../../utils";
import type { ArrayInput, ArrayRequirement } from "../types";

/**
 * Every item issue type.
 */
export interface EveryItemIssue<TInput extends ArrayInput> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "every_item";
	/**
	 * The expected property.
	 */
	readonly expected: undefined;
	/**
	 * The validation function.
	 */
	readonly requirement: ArrayRequirement<TInput>;
}

/**
 * Every item action type.
 */
export interface EveryItemAction<
	TInput extends ArrayInput,
	TMessage extends ErrorMessage<EveryItemIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, EveryItemIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "every_item";
	/**
	 * The action reference.
	 */
	readonly reference: typeof everyItem;
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
 * Creates an every item validation action.
 *
 * @param requirement The validation function.
 *
 * @returns An every item action.
 */
export function everyItem<TInput extends ArrayInput>(
	requirement: ArrayRequirement<TInput>,
): EveryItemAction<TInput, undefined>;

/**
 * Creates an every item validation action.
 *
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns An every item action.
 */
export function everyItem<
	TInput extends ArrayInput,
	const TMessage extends ErrorMessage<EveryItemIssue<TInput>> | undefined,
>(requirement: ArrayRequirement<TInput>, message: TMessage): EveryItemAction<TInput, TMessage>;

export function everyItem(
	requirement: ArrayRequirement<unknown[]>,
	message?: ErrorMessage<EveryItemIssue<unknown[]>>,
): EveryItemAction<unknown[], ErrorMessage<EveryItemIssue<unknown[]>> | undefined> {
	return {
		kind: "validation",
		type: "every_item",
		reference: everyItem,
		async: false,
		expects: undefined,
		requirement,
		message,
		_run(dataset, config) {
			if (
				dataset.typed &&
				!(dataset.value as defined[]).every(
					(this as EveryItemAction<unknown[], ErrorMessage<EveryItemIssue<unknown[]>> | undefined>)
						.requirement as unknown as ArrayRequirement<MaybeReadonly<defined[]>>,
				)
			) {
				_addIssue(this, "item", dataset, config);
			}
			return dataset;
		},
	};
}
