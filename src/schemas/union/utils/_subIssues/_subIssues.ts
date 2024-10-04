import type { BaseIssue, OutputDataset } from "../../../../types";

/**
 * Returns the sub issues of the provided datasets for the union issue.
 *
 * @param datasets The datasets.
 *
 * @returns The sub issues.
 *
 * @internal
 */
export function _subIssues(
	datasets: OutputDataset<unknown, BaseIssue<unknown>>[] | undefined,
): [BaseIssue<unknown>, ...BaseIssue<unknown>[]] | undefined {
	let issues: [BaseIssue<unknown>, ...BaseIssue<unknown>[]] | undefined;
	if (datasets) {
		for (const dataset of datasets) {
			if (issues !== undefined) {
				// Hint: According to the implementation of `union` and `unionAsync`,
				// `dataset.issues` can never be `undefined`.
				for (const issue of dataset.issues!) {
					issues.push(issue);
				}
			} else {
				issues = dataset.issues;
			}
		}
	}
	return issues;
}
