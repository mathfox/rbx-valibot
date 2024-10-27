import type { BaseIssue, BaseSchema, InferInput, UnknownDataset } from "../../types/index.js";
import { ValiError } from "../../utils/index.js";
/**
 * Checks if the input matches the schema. As this is an assertion function, it
 * can be used as a type guard.
 *
 * @param schema The schema to be used.
 * @param input The input to be tested.
 */
export function assert_<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	schema: TSchema,
	input: unknown,
): asserts input is InferInput<TSchema> {
	const issues = schema._run({ value: input } as UnknownDataset, { abortEarly: true }).issues;
	if (issues) {
		throw new ValiError(issues);
	}
}
