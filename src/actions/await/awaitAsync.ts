import type { BaseTransformationAsync, TypedDataset } from "../../types/index.ts";

/**
 * Await action async type.
 */
export interface AwaitActionAsync<TInput extends Promise<unknown>>
	extends BaseTransformationAsync<TInput, Awaited<TInput>, never> {
	/**
	 * The action type.
	 */
	readonly type: "await";
	/**
	 * The action reference.
	 */
	readonly reference: typeof awaitAsync;
}

/**
 * Creates an await transformation action.
 *
 * @returns An await action.
 */
export function awaitAsync<TInput extends Promise<unknown>>(): AwaitActionAsync<TInput> {
	return {
		kind: "transformation",
		type: "await",
		reference: awaitAsync,
		async: true,
		async _run(dataset) {
			// DEVIATION: manual cast was required
			dataset.value = (await dataset.value) as TInput;
			return dataset as TypedDataset<Awaited<TInput>, never>;
		},
	};
}
