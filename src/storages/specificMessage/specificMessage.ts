import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	BaseTransformation,
	BaseTransformationAsync,
	BaseValidation,
	BaseValidationAsync,
	ErrorMessage,
	InferIssue,
} from "../../types";

/**
 * Reference type.
 */
type Reference = (
	...args: any[]
) =>
	| BaseSchema<unknown, unknown, BaseIssue<unknown>>
	| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
	| BaseValidation<unknown, unknown, BaseIssue<unknown>>
	| BaseValidationAsync<unknown, unknown, BaseIssue<unknown>>
	| BaseTransformation<unknown, unknown, BaseIssue<unknown>>
	| BaseTransformationAsync<unknown, unknown, BaseIssue<unknown>>;

const UndefinedMarker = {};

// Create specific message store
let store: Map<Reference, Map<string | typeof UndefinedMarker, ErrorMessage<BaseIssue<unknown>>>> | undefined;

/**
 * Sets a specific error message.
 *
 * @param reference The identifier reference.
 * @param message The error message.
 * @param lang The language of the message.
 */
export function setSpecificMessage<const TReference extends Reference>(
	reference: TReference,
	message: ErrorMessage<InferIssue<ReturnType<TReference>>>,
	lang?: string,
): void {
	if (!store) store = new Map();
	if (!store.get(reference)) store.set(reference, new Map());
	store.get(reference)!.set(lang ?? UndefinedMarker, message);
}

/**
 * Returns a specific error message.
 *
 * @param reference The identifier reference.
 * @param lang The language of the message.
 *
 * @returns The error message.
 */
export function getSpecificMessage<const TReference extends Reference>(
	reference: TReference,
	lang?: string,
): ErrorMessage<InferIssue<ReturnType<TReference>>> | undefined {
	return store?.get(reference)?.get(lang ?? UndefinedMarker);
}

/**
 * Deletes a specific error message.
 *
 * @param reference The identifier reference.
 * @param lang The language of the message.
 */
export function deleteSpecificMessage(reference: Reference, lang?: string): void {
	store?.get(reference)?.delete(lang ?? UndefinedMarker);
}
