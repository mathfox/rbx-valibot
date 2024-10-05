import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseTransformationAsync, MaybePromise, OutputDataset } from "../../types";
import { _addIssue } from "../../utils";
import type { Context, RawTransformIssue } from "./types";

/**
 * Raw transform action async type.
 */
export interface RawTransformActionAsync<TInput, TOutput>
	extends BaseTransformationAsync<TInput, TOutput, RawTransformIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "raw_transform";
	/**
	 * The action reference.
	 */
	readonly reference: typeof rawTransformAsync;
}

/**
 * Creates a raw transformation action.
 *
 * @param action The transformation action.
 *
 * @returns A raw transform action.
 */
export function rawTransformAsync<TInput, TOutput>(
	action: (context: Context<TInput>) => MaybePromise<TOutput>,
): RawTransformActionAsync<TInput, TOutput> {
	return {
		kind: "transformation",
		type: "raw_transform",
		reference: rawTransformAsync,
		async: true,
		async _run(dataset, config = getGlobalConfig()) {
			// Execute action and get its output
			const output = await action({
				dataset,
				config,
				addIssue: (info) => _addIssue(this, info?.label ?? "input", dataset, config, info as any),
				NEVER: undefined as never,
			});

			// Update dataset depending on issues
			if (dataset.issues) {
				dataset.typed = false as true;
			} else {
				dataset.value = output as TInput;
			}

			// Return output dataset
			return dataset as unknown as OutputDataset<TOutput, BaseIssue<unknown> | RawTransformIssue<TInput>>;
		},
	};
}
