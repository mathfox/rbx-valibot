import type { BaseIssue, BaseSchema, Dataset, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";

/**
 * Class type.
 */
export type Class = new (...args: any[]) => any;

/**
 * Instance issue type.
 */
export interface InstanceIssue extends BaseIssue<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "instance";
	/**
	 * The expected property.
	 */
	readonly expected: string;
}

/**
 * Instance schema type.
 */
export interface InstanceSchema<TClass extends Class, TMessage extends ErrorMessage<InstanceIssue> | undefined>
	extends BaseSchema<InstanceType<TClass>, InstanceType<TClass>, InstanceIssue> {
	/**
	 * The schema type.
	 */
	readonly type: "instance";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof instance;
	/**
	 * The class of the instance.
	 */
	readonly class: TClass;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates an instance schema.
 *
 * @param class_ The class of the instance.
 *
 * @returns An instance schema.
 */
export function instance<TClass extends Class>(class_: TClass): InstanceSchema<TClass, undefined>;

/**
 * Creates an instance schema.
 *
 * @param class_ The class of the instance.
 * @param message The error message.
 *
 * @returns An instance schema.
 */
export function instance<TClass extends Class, const TMessage extends ErrorMessage<InstanceIssue> | undefined>(
	class_: TClass,
	message: TMessage,
): InstanceSchema<TClass, TMessage>;

export function instance(
	class_: Class,
	message?: ErrorMessage<InstanceIssue>,
): InstanceSchema<Class, ErrorMessage<InstanceIssue> | undefined> {
	return {
		kind: "schema",
		type: "instance",
		reference: instance,
		expects: tostring(class_),
		async: false,
		class: class_,
		message,
		_run(dataset, config) {
			if (dataset.value instanceof (this as InstanceSchema<Class, ErrorMessage<InstanceIssue> | undefined>).class) {
				dataset.typed = true;
			} else {
				_addIssue(this, "type", dataset, config);
			}

			return dataset as Dataset<InstanceType<Class>, InstanceIssue>;
		},
	};
}
