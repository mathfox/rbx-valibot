import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseSchema, InferInput, InferIssue, InferOutput } from "../../types";

/**
 * Lazy schema type.
 */
export interface LazySchema<TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>
	extends BaseSchema<InferInput<TWrapped>, InferOutput<TWrapped>, InferIssue<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "lazy";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof lazy;
	/**
	 * The expected property.
	 */
	readonly expects: "unknown";
	/**
	 * The schema getter.
	 */
	readonly getter: (input: unknown) => TWrapped;
}

/**
 * Creates a lazy schema.
 *
 * @param getter The schema getter.
 *
 * @returns A lazy schema.
 */
export function lazy<const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	getter: (input: unknown) => TWrapped,
): LazySchema<TWrapped> {
	return {
		kind: "schema",
		type: "lazy",
		reference: lazy,
		expects: "unknown",
		async: false,
		getter,
		_run(dataset, config = getGlobalConfig()) {
			return (this as LazySchema<TWrapped>).getter(dataset.value)._run(dataset, config);
		},
	};
}
