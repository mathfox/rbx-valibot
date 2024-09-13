import type { BaseMetadata } from "../../types";

/**
 * Description action type.
 */
export interface DescriptionAction<TInput, TDescription extends string> extends BaseMetadata<TInput> {
	/**
	 * The action type.
	 */
	readonly type: "description";
	/**
	 * The action reference.
	 */
	readonly reference: typeof description;
	/**
	 * The description text.
	 */
	readonly description: TDescription;
}

/**
 * Creates a description metadata action.
 *
 * @param description_ The description text.
 *
 * @returns A description action.
 */
export function description<TInput, TDescription extends string>(
	description_: TDescription,
): DescriptionAction<TInput, TDescription> {
	return {
		kind: "metadata",
		type: "description",
		reference: description,
		description: description_,
	};
}
