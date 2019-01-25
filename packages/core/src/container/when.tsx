import * as React from 'react';

export interface WhenProps {
	[key: string]: boolean | React.ReactNode;
	children: React.ReactNode;
}

export const When: React.SFC<WhenProps> = function When(props) {
	const keys = Object.keys(props).filter(key => typeof props[key] === 'boolean');
	const truthy = keys.every(key => props[key] === true);

	if (!truthy) {
		return null;
	}

	const children = React.Children.toArray(props.children).filter(
		(c): c is React.ReactElement<unknown> => typeof c !== 'string'
	);
	const hasSlot = children.some(child => [WhenTruthy, WhenFalsy].includes(child.type as any));
	return <>{children.filter(getFilter({ truthy, hasSlot }))}</>;
};

export const WhenTruthy: React.SFC = function WhenTruthy(props) {
	return <>{props.children}</>;
};

export const WhenFalsy: React.SFC = function WhenTruthy(props) {
	return <>{props.children}</>;
};

function getFilter(context: {
	truthy: boolean;
	hasSlot: boolean;
}): (node: React.ReactElement<unknown>) => boolean {
	if (!context.hasSlot) {
		return () => context.truthy;
	}

	const Component = context.truthy ? WhenTruthy : WhenFalsy;
	return node => typeof node.type !== 'string' && node.type === Component;
}
