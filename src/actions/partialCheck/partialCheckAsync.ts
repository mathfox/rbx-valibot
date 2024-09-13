import type { BaseValidationAsync, DeepPickN, ErrorMessage, MaybePromise, PathKeys } from "../../types";
import { _addIssue } from "../../utils";
import type { PartialCheckIssue, PartialInput } from "./types";
import { _isPartiallyTyped } from "./utils";

/**
 * Partial check action async type.
 *
 * TODO: Should we add a `pathList` property?
 */
export interface PartialCheckActionAsync<
	TInput extends PartialInput,
	TSelection extends PartialInput,
	TMessage extends ErrorMessage<PartialCheckIssue<TSelection>> | undefined,
> extends BaseValidationAsync<TInput, TInput, PartialCheckIssue<TSelection>> {
	/**
	 * The action type.
	 */
	readonly type: "partial_check";
	/**
	 * The action reference.
	 */
	readonly reference: typeof partialCheckAsync;
	/**
	 * The expected property.
	 */
	readonly expects: undefined;
	/**
	 * The validation function.
	 */
	readonly requirement: (input: TSelection) => MaybePromise<boolean>;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a partial check validation action.
 *
 * @param pathList The selected paths.
 * @param requirement The validation function.
 *
 * @returns A partial check action.
 */
export function partialCheckAsync<
	TInput extends PartialInput,
	const TPathList extends readonly PathKeys<TInput>[],
	const TSelection extends DeepPickN<TInput, TPathList>,
>(
	pathList: TPathList,
	requirement: (input: TSelection) => MaybePromise<boolean>,
): PartialCheckActionAsync<TInput, TSelection, undefined>;

/**
 * Creates a partial check validation action.
 *
 * @param pathList The selected paths.
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns A partial check action.
 */
export function partialCheckAsync<
	TInput extends PartialInput,
	const TPathList extends readonly PathKeys<TInput>[],
	const TSelection extends DeepPickN<TInput, TPathList>,
	const TMessage extends ErrorMessage<PartialCheckIssue<TSelection>> | undefined,
>(
	pathList: TPathList,
	requirement: (input: TSelection) => MaybePromise<boolean>,
	message: TMessage,
): PartialCheckActionAsync<TInput, TSelection, TMessage>;

export function partialCheckAsync(
	pathList: PathKeys<PartialInput>[],
	requirement: (input: PartialInput) => MaybePromise<boolean>,
	message?: ErrorMessage<PartialCheckIssue<PartialInput>>,
): PartialCheckActionAsync<PartialInput, PartialInput, ErrorMessage<PartialCheckIssue<PartialInput>> | undefined> {
	return {
		kind: "validation",
		type: "partial_check",
		reference: partialCheckAsync,
		async: true,
		expects: undefined,
		requirement,
		message,
		async _run(dataset, config) {
			if (_isPartiallyTyped(dataset, pathList) && !(await this.requirement(dataset.value as PartialInput))) {
				_addIssue(this, "input", dataset, config);
			}
			return dataset;
		},
	};
}
