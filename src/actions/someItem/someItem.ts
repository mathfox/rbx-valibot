import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseValidation, ErrorMessage, MaybeReadonly } from "../../types";
import { _addIssue } from "../../utils";
import type { ArrayInput, ArrayRequirement } from "../types";

/**
 * Some item issue type.
 */
export interface SomeItemIssue<TInput extends ArrayInput> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "some_item";
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
 * Some item action type.
 */
export interface SomeItemAction<
	TInput extends ArrayInput,
	TMessage extends ErrorMessage<SomeItemIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, SomeItemIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "some_item";
	/**
	 * The action reference.
	 */
	readonly reference: typeof someItem;
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
 * Creates a some item validation action.
 *
 * @param requirement The validation function.
 *
 * @returns A some item action.
 */
export function someItem<TInput extends ArrayInput>(
	requirement: ArrayRequirement<TInput>,
): SomeItemAction<TInput, undefined>;

/**
 * Creates a some item validation action.
 *
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns A some item action.
 */
export function someItem<
	TInput extends ArrayInput,
	const TMessage extends ErrorMessage<SomeItemIssue<TInput>> | undefined,
>(requirement: ArrayRequirement<TInput>, message: TMessage): SomeItemAction<TInput, TMessage>;

export function someItem(
	requirement: ArrayRequirement<unknown[]>,
	message?: ErrorMessage<SomeItemIssue<unknown[]>>,
): SomeItemAction<unknown[], ErrorMessage<SomeItemIssue<unknown[]>> | undefined> {
	return {
		kind: "validation",
		type: "some_item",
		reference: someItem,
		async: false,
		expects: undefined,
		requirement,
		message,
		_run(dataset, config = getGlobalConfig()) {
			if (
				dataset.typed &&
				!(dataset.value as Array<defined>).some(
					(this as SomeItemAction<unknown[], ErrorMessage<SomeItemIssue<unknown[]>> | undefined>)
						.requirement as ArrayRequirement<MaybeReadonly<defined[]>>,
				)
			) {
				_addIssue(this, "item", dataset, config);
			}

			return dataset;
		},
	};
}
