import * as React from 'react';
import styled from 'styled-components';

export interface SpaceProps {
	children?: React.ReactNode;
	className?: string;
	inside?: boolean;
	size?: SpaceSize | SpaceSize[];
	sizeBottom?: SpaceSize;
	sizeLeft?: SpaceSize;
	sizeRight?: SpaceSize;
	sizeTop?: SpaceSize;
}

export interface StyledSpaceProps {
	inside: boolean;
	// Redefine `size` as `spaceSize` property for styled components to avoid collision
	// with `size` property on `React.HTMLAttributes` interface.
	spaceSize: SpaceSize[];
}

export enum SpaceSize {
	// Explicity set enum values to indicate that they will be used later on as
	// array indicies.
	None = 0,
	XXS = 3,
	XS = 6,
	S = 12,
	M = 15,
	L = 18,
	XL = 24,
	XXL = 32,
	XXXL = 42
}

export enum PageInset {
	// Defines global page gutter used in header and footer components
	XS = 24,
	S = 42,
	M = 60,
	L = 78,
	XL = 96
}

/**
 * Calculates the actual value for the given size and breakpoint, based on the
 * given growth mapping.
 * @param size The size used for calculation.
 */
export function getSpace(size: SpaceSize): number {
	if (undefined !== size) {
		return size;
	}
	return 0;
}

function expand<T>(source: T[] | T): T[] {
	const values: T[] = Array.isArray(source) ? source : [source];

	switch (values.length) {
		case 1: // [a]          => [a, a, a, a]
			return [values[0], values[0], values[0], values[0]];
		case 2: // [a, b]       => [a, b, a, b]
			return [...values, ...values];
		case 3: // [a, b, c]    => [a, b, c, b]
			return [...values, values[1]];
		case 4: // [a, b, c, d] => [a, b, c, d]
		default:
			return values.slice(0, 4);
	}
}

function merge<T>(shorthand: T | T[], top?: T, right?: T, bottom?: T, left?: T): T[] {
	const expanded = expand<T>(shorthand);

	return [
		top === undefined ? expanded[0] : top,
		right === undefined ? expanded[1] : right,
		bottom === undefined ? expanded[2] : bottom,
		left === undefined ? expanded[3] : left
	];
}

function calculate(property: string, space: SpaceSize[]): string {
	const values = space.map<string>((value, index) => `${getSpace(value)}px`);

	const result = `${property}: ${values.join(' ')};`;

	return result;
}

const StyledSpace = styled.div`
	box-sizing: border-box;
	${(props: StyledSpaceProps) => calculate(props.inside ? 'padding' : 'margin', props.spaceSize)};
`;

export const Space: React.StatelessComponent<SpaceProps> = props => {
	const size = merge<number>(
		props.size || 0,
		props.sizeTop,
		props.sizeRight,
		props.sizeBottom,
		props.sizeLeft
	);

	return (
		<StyledSpace className={props.className} spaceSize={size} inside={Boolean(props.inside)}>
			{props.children}
		</StyledSpace>
	);
};
