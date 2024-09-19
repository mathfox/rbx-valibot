import type { BaseIssue } from "../../types";

/**
 * Object issue type.
 */
export interface ObjectIssue extends BaseIssue<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "object";
	/**
	 * The expected property.
	 */
	readonly expected: "Object";
}
