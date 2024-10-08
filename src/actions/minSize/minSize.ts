import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import type { SizeInput } from "../types";

/**
 * Min size issue type.
 */
export interface MinSizeIssue<TInput extends SizeInput, TRequirement extends number> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "min_size";
	/**
	 * The expected property.
	 */
	readonly expected: `>=${TRequirement}`;
	/**
	 * The received property.
	 */
	readonly received: `${number}`;
	/**
	 * The minimum size.
	 */
	readonly requirement: TRequirement;
}

/**
 * Min size action type.
 */
export interface MinSizeAction<
	TInput extends SizeInput,
	TRequirement extends number,
	TMessage extends ErrorMessage<MinSizeIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MinSizeIssue<TInput, TRequirement>> {
	/**
	 * The action type.
	 */
	readonly type: "min_size";
	/**
	 * The action reference.
	 */
	readonly reference: typeof minSize;
	/**
	 * The expected property.
	 */
	readonly expects: `>=${TRequirement}`;
	/**
	 * The minimum size.
	 */
	readonly requirement: TRequirement;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a min size validation action.
 *
 * @param requirement The minimum size.
 *
 * @returns A min size action.
 */
export function minSize<TInput extends SizeInput, const TRequirement extends number>(
	requirement: TRequirement,
): MinSizeAction<TInput, TRequirement, undefined>;

/**
 * Creates a min size validation action.
 *
 * @param requirement The minimum size.
 * @param message The error message.
 *
 * @returns A min size action.
 */
export function minSize<
	TInput extends SizeInput,
	const TRequirement extends number,
	const TMessage extends ErrorMessage<MinSizeIssue<TInput, TRequirement>> | undefined,
>(requirement: TRequirement, message: TMessage): MinSizeAction<TInput, TRequirement, TMessage>;

export function minSize(
	requirement: number,
	message?: ErrorMessage<MinSizeIssue<SizeInput, number>>,
): MinSizeAction<SizeInput, number, ErrorMessage<MinSizeIssue<SizeInput, number>> | undefined> {
	return {
		kind: "validation",
		type: "min_size",
		reference: minSize,
		async: false,
		expects: `>=${requirement}`,
		requirement,
		message,
		_run(dataset, config = getGlobalConfig()) {
			const typedThis = this as MinSizeAction<
				SizeInput,
				number,
				ErrorMessage<MinSizeIssue<SizeInput, number>> | undefined
			>;

			if (dataset.typed && (dataset.value as ReadonlySet<unknown>).size() < typedThis.requirement) {
				_addIssue(this, "size", dataset, config, {
					received: `${(dataset.value as ReadonlySet<unknown>).size()}`,
				});
			}

			return dataset;
		},
	};
}
