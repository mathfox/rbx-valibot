import type { BaseTransformationAsync, TypedDataset } from "../../types";

/**
 * Transform action async type.
 */
export interface TransformActionAsync<TInput, TOutput> extends BaseTransformationAsync<TInput, TOutput, never> {
	/**
	 * The action type.
	 */
	readonly type: "transform";
	/**
	 * The action reference.
	 */
	readonly reference: typeof transformAsync;
	/**
	 * The transformation operation.
	 */
	readonly operation: (input: TInput) => Promise<TOutput>;
}

/**
 * Creates a custom transformation action.
 *
 * @param operation The transformation operation.
 *
 * @returns A transform action.
 */
export function transformAsync<TInput, TOutput>(
	operation: (input: TInput) => Promise<TOutput>,
): TransformActionAsync<TInput, TOutput> {
	return {
		kind: "transformation",
		type: "transform",
		reference: transformAsync,
		async: true,
		operation,
		async _run(dataset) {
			dataset.value = (await this.operation(dataset.value)) as any;
			return dataset as unknown as TypedDataset<TOutput, never>;
		},
	};
}
