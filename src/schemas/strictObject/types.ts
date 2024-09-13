import type { BaseIssue } from "../../types";

/**
 * Strict object issue type.
 */
export interface StrictObjectIssue extends BaseIssue<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "strict_object";
	/**
	 * The expected property.
	 */
	readonly expected: "Object" | "never";
}
