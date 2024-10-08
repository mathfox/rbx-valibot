import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseSchema, ErrorMessage, OutputDataset } from "../../types";
import { _addIssue, _stringify } from "../../utils";

/**
 * Literal issue type.
 */
export interface LiteralIssue extends BaseIssue<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "literal";
	/**
	 * The expected property.
	 */
	readonly expected: string;
}

/**
 * Literal schema type.
 */
export interface LiteralSchema<TLiteral, TMessage extends ErrorMessage<LiteralIssue> | undefined>
	extends BaseSchema<TLiteral, TLiteral, LiteralIssue> {
	/**
	 * The schema type.
	 */
	readonly type: "literal";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof literal;
	/**
	 * The literal value.
	 */
	readonly literal: TLiteral;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a literal schema.
 *
 * @param literal_ The literal value.
 *
 * @returns A literal schema.
 */
export function literal<const TLiteral>(literal_: TLiteral): LiteralSchema<TLiteral, undefined>;

/**
 * Creates a literal schema.
 *
 * @param literal_ The literal value.
 * @param message The error message.
 *
 * @returns A literal schema.
 */
export function literal<const TLiteral, const TMessage extends ErrorMessage<LiteralIssue> | undefined>(
	literal_: TLiteral,
	message: TMessage,
): LiteralSchema<TLiteral, TMessage>;

export function literal<TLiteral>(
	literal_: TLiteral,
	message?: ErrorMessage<LiteralIssue>,
): LiteralSchema<TLiteral, ErrorMessage<LiteralIssue> | undefined> {
	return {
		kind: "schema",
		type: "literal",
		reference: literal,
		expects: _stringify(literal_),
		async: false,
		literal: literal_,
		message,
		_run(dataset, config = getGlobalConfig()) {
			if (dataset.value === (this as LiteralSchema<unknown, ErrorMessage<LiteralIssue> | undefined>).literal) {
				dataset.typed = true;
			} else {
				_addIssue(this, "type", dataset, config);
			}

			return dataset as OutputDataset<TLiteral, LiteralIssue>;
		},
	};
}
