import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';

export enum IconName {
	ArrowDown
}
export interface IconRegistryProps {
	names: typeof IconName;
}

export interface IconProps {
	className?: string;
	color?: Color;
	name?: IconName;
	size?: IconSize;
}

export enum IconSize {
	XS = 24,
	S = 30,
	M = 48,
	L = 52
}

interface StyledIconProps {
	className?: string;
	iconColor?: Color;
	size?: IconSize;
}

interface IconRegistrySymbolProps {
	children: React.ReactNode;
	id: string;
	size: 'small' | 'large';
}

const icons: { readonly [key: string]: JSX.Element[][] | JSX.Element[] } = {
	[IconName.ArrowDown]: [
		[<path key="arrow-down" d="M12 15.5l6.06217783-7H5.93782217" />],
		[<path key="arrow-down" d="M24 31l12.12435565-14h-24.2487113" />]
	]
};

const StyledIconRegistry = styled.svg`
	display: none;
`;

const StyledIcon = styled.svg`
	width: ${(props: StyledIconProps) => props.size || IconSize.S}px;
	height: ${(props: StyledIconProps) => props.size || IconSize.S}px;

	color: ${(props: StyledIconProps) => (props.iconColor ? props.iconColor.toString() : 'inherit')};
	fill: currentColor;
	stroke: none;
`;

const IconRegistrySymbol: React.StatelessComponent<IconRegistrySymbolProps> = props => {
	return (
		<symbol
			id={`${props.id}-${props.size}`}
			viewBox={props.size === 'small' ? '0 0 24 24' : '0 0 48 48'}
		>
			{props.children}
		</symbol>
	);
};

/** @ignore */
export const IconRegistry: React.StatelessComponent<IconRegistryProps> = (props): JSX.Element => {
	return (
		<StyledIconRegistry>
			{reduce(props.names, (name, e) => {
				const [small, large] = icons[e];

				return [
					<IconRegistrySymbol id={name} key={`${name}-small`} size="small">
						{small}
					</IconRegistrySymbol>,
					<IconRegistrySymbol id={name} key={`${name}-large`} size="large">
						{large || small}
					</IconRegistrySymbol>
				];
			})}
		</StyledIconRegistry>
	);
};

function getIconRef(name: string, size: IconSize): string {
	switch (size) {
		case IconSize.XS:
		case IconSize.S:
			return `#${name}-small`;
		case IconSize.M:
		case IconSize.L:
		default:
			return `#${name}-large`;
	}
}

/** @ignore */
export const Icon: React.StatelessComponent<IconProps> = (props): JSX.Element => {
	const icon = typeof props.name === 'number' ? IconName[props.name] : null;
	return (
		<StyledIcon className={props.className} iconColor={props.color} size={props.size}>
			{icon !== null && <use xlinkHref={getIconRef(icon, props.size || IconSize.S)} />}
		</StyledIcon>
	);
};

export function reduce(
	e: typeof IconName,
	cb: (name: string, e: number) => JSX.Element[]
): JSX.Element[] {
	const results = [];

	for (const n in e) {
		if (isNaN(Number(n))) {
			results.push(...cb(n, Number(e[n])));
		}
	}

	return results;
}
