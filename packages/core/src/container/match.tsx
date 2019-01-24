import * as React from 'react';

export interface MatchProps<T> {
	value: T;
	children: React.ReactNode;
}

export interface BranchProps<T> {
	when: ((value: T) => boolean) | T;
	children?: React.ReactNode;
}

export const Match = function Match<T>(props: MatchProps<T>): JSX.Element | null {
	const branch = React.Children.toArray(props.children)
		.filter(
			(child): child is React.ReactElement<BranchProps<T>> =>
				typeof child === 'object' && child.type === MatchBranch
		)
		.find(branch => {
			if (typeof branch.props.when === 'function') {
				const when = branch.props.when as ((value: T) => boolean);
				return when(props.value);
			}
			return branch.props.when === props.value;
		});

	return branch || null;
};

export const MatchBranch = function Branch<T>(props: BranchProps<T>): JSX.Element {
	return <>{props.children}</>;
};
