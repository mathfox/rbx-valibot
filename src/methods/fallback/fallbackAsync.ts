import { getGlobalConfig } from "../../storages";
import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	Config,
	InferIssue,
	InferOutput,
	MaybePromise,
	OutputDataset,
	UnknownDataset,
} from "../../types";
import { getFallback } from "../getFallback";

/**
 * Fallback async type.
 */
export type FallbackAsync<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> =
	| InferOutput<TSchema>
	| ((
			dataset?: OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>,
			config?: Config<InferIssue<TSchema>>,
	  ) => MaybePromise<InferOutput<TSchema>>);

/**
 * Schema with fallback async type.
 */
export type SchemaWithFallbackAsync<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TFallback extends FallbackAsync<TSchema>,
> = Omit<TSchema, "async" | "_run"> & {
	/**
	 * The fallback value.
	 */
	readonly fallback: TFallback;
	/**
	 * Whether it's async.
	 */
	readonly async: true;
	/**
	 * Parses unknown input.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly _run: (
		this: unknown,
		dataset: UnknownDataset,
		config: Config<BaseIssue<unknown>>,
	) => Promise<OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>>;
};

/**
 * Returns a fallback value as output if the input does not match the schema.
 *
 * @param schema The schema to catch.
 * @param fallback The fallback value.
 *
 * @returns The passed schema.
 */
export function fallbackAsync<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TFallback extends FallbackAsync<TSchema>,
>(schema: TSchema, fallback: TFallback): SchemaWithFallbackAsync<TSchema, TFallback> {
	return {
		...schema,
		fallback,
		async: true,
		async _run(dataset, config = getGlobalConfig()) {
			const outputDataset = await (
				schema as SchemaWithFallbackAsync<BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TFallback>
			)._run(dataset, config);

			return outputDataset.issues
				? { typed: true, value: await getFallback(this as unknown as TSchema, outputDataset, config) }
				: outputDataset;
		},
	};
}
