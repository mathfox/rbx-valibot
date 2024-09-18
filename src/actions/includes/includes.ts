import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import type { ContentInput, ContentRequirement } from "../types";

/**
 * Includes issue type.
 */
export interface IncludesIssue<TInput extends ContentInput, TRequirement extends ContentRequirement<TInput>>
	extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "includes";
	/**
	 * The expected property.
	 */
	readonly expected: string;
	/**
	 * The content to be included.
	 */
	readonly requirement: TRequirement;
}

/**
 * Includes action type.
 */
export interface IncludesAction<
	TInput extends ContentInput,
	TRequirement extends ContentRequirement<TInput>,
	TMessage extends ErrorMessage<IncludesIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, IncludesIssue<TInput, TRequirement>> {
	/**
	 * The action type.
	 */
	readonly type: "includes";
	/**
	 * The action reference.
	 */
	readonly reference: typeof includes;
	/**
	 * The expected property.
	 */
	readonly expects: string;
	/**
	 * The content to be included.
	 */
	readonly requirement: TRequirement;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates an includes validation action.
 *
 * @param requirement The content to be included.
 *
 * @returns An includes action.
 */
export function includes<TInput extends ContentInput, const TRequirement extends ContentRequirement<TInput>>(
	requirement: TRequirement,
): IncludesAction<TInput, TRequirement, undefined>;

/**
 * Creates an includes validation action.
 *
 * @param requirement The content to be included.
 * @param message The error message.
 *
 * @returns An includes action.
 */
export function includes<
	TInput extends ContentInput,
	const TRequirement extends ContentRequirement<TInput>,
	const TMessage extends ErrorMessage<IncludesIssue<TInput, TRequirement>> | undefined,
>(requirement: TRequirement, message: TMessage): IncludesAction<TInput, TRequirement, TMessage>;

export function includes(
	requirement: ContentRequirement<ContentInput>,
	message?: ErrorMessage<IncludesIssue<ContentInput, ContentRequirement<ContentInput>>>,
): IncludesAction<
	ContentInput,
	ContentRequirement<ContentInput>,
	ErrorMessage<IncludesIssue<ContentInput, ContentRequirement<ContentInput>>> | undefined
> {
	const expects = tostring(requirement);

	return {
		kind: "validation",
		type: "includes",
		reference: includes,
		async: false,
		expects,
		requirement,
		message,
		_run(dataset, config) {
			if (dataset.typed) {
				if (
					(typeIs(dataset.value, "string") && dataset.value.find(this.requirement as string)[0] === undefined) ||
					(dataset.value as defined[]).find((value) => value === this.requirement) === undefined
				) {
					_addIssue(this, "content", dataset, config, {
						received: `!${expects}`,
					});
				}
			}
			return dataset;
		},
	};
}
