import type { BaseIssue, ErrorMessage } from "../../types";

const UndefinedMarker = {};

// Create schema message store
let store: Map<string | typeof UndefinedMarker, ErrorMessage<BaseIssue<unknown>>> | undefined;

/**
 * Sets a schema error message.
 *
 * @param message The error message.
 * @param lang The language of the message.
 */
export function setSchemaMessage(message: ErrorMessage<BaseIssue<unknown>>, lang?: string): void {
	if (!store) store = new Map();
	store.set(lang ?? UndefinedMarker, message);
}

/**
 * Returns a schema error message.
 *
 * @param lang The language of the message.
 *
 * @returns The error message.
 */
export function getSchemaMessage(lang?: string): ErrorMessage<BaseIssue<unknown>> | undefined {
	return store?.get(lang ?? UndefinedMarker);
}

/**
 * Deletes a schema error message.
 *
 * @param lang The language of the message.
 */
export function deleteSchemaMessage(lang?: string): void {
	store?.delete(lang ?? UndefinedMarker);
}
