import { getGlobalMessage, getSchemaMessage, getSpecificMessage } from "../../storages";
import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	BaseTransformation,
	BaseTransformationAsync,
	BaseValidation,
	BaseValidationAsync,
	Config,
	ErrorMessage,
	InferInput,
	InferIssue,
	OutputDataset,
	UnknownDataset,
} from "../../types";
import { _stringify } from "../_stringify";

/**
 * Context type.
 */
type Context =
	| BaseSchema<unknown, unknown, BaseIssue<unknown>>
	| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
	| BaseValidation<any, unknown, BaseIssue<unknown>>
	| BaseValidationAsync<any, unknown, BaseIssue<unknown>>
	| BaseTransformation<any, unknown, BaseIssue<unknown>>
	| BaseTransformationAsync<any, unknown, BaseIssue<unknown>>;

/**
 * Other type.
 */
interface Other<TContext extends Context> {
	input?: unknown | undefined;
	expected?: string | undefined;
	received?: string | undefined;
	message?: ErrorMessage<InferIssue<TContext>> | undefined;
	issues?: [BaseIssue<InferInput<TContext>>, ...BaseIssue<InferInput<TContext>>[]] | undefined;
}

/**
 * Adds an issue to the dataset.
 *
 * @param context The issue context.
 * @param label The issue label.
 * @param dataset The input dataset.
 * @param config The configuration.
 * @param other The optional props.
 *
 * @internal
 */
export function _addIssue<const TContext extends Context>(
	context: TContext & {
		expects?: string | undefined;
		requirement?: unknown;
		message?: ErrorMessage<Extract<InferIssue<TContext>, { type: TContext["type"] }>> | undefined;
	},
	label: string,
	dataset: UnknownDataset | OutputDataset<unknown, BaseIssue<unknown>>,
	config: Config<any>, // InferIssue<TContext>
	other?: Other<TContext>,
): void {
	// Get expected and received string
	const input = other && "input" in other ? other.input : dataset.value;
	const expected = other?.expected ?? (context as unknown as { expects: string }).expects ?? undefined;
	const received = other?.received ?? _stringify(input);

	// Create issue object
	// Hint: The issue is deliberately not constructed with the spread operator
	// for performance reasons
	const issue: BaseIssue<unknown> = {
		kind: context.kind,
		type: context.type,
		input,
		expected,
		received,
		message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
		requirement: (context as unknown as { requirement: unknown | undefined }).requirement,
		issues: other?.issues,
		lang: config.lang,
		abortEarly: config.abortEarly,
		abortPipeEarly: config.abortPipeEarly,
	};

	// Check if context is a schema
	const isSchema = context.kind === "schema";

	// Get custom issue message
	const message =
		other?.message ??
		(context as unknown as { message: string | undefined }).message ??
		getSpecificMessage(context.reference, issue.lang) ??
		(isSchema ? getSchemaMessage(issue.lang) : undefined) ??
		config.message ??
		getGlobalMessage(issue.lang);

	// If custom message if specified, override default message
	if (message) {
		(issue as { message: string }).message = typeIs(message, "function") ? message(issue) : message;
	}

	// If context is a schema, set typed to `false`
	if (isSchema) {
		dataset.typed = false;
	}

	// Add issue to dataset
	if (dataset.issues) {
		dataset.issues.push(issue);
	} else {
		(dataset as unknown as { issues: defined[] }).issues = [issue];
	}
}
