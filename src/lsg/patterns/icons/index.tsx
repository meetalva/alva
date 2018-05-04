import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export enum IconName {
	ArrowRight,
	ArrowLeft,
	ArrowFillRight,
	ArrowFillLeft,
	Robo,
	Pattern
}
export interface IconRegistryProps {
	names: typeof IconName;
}

export interface IconProps {
	className?: string;
	color?: Color;
	dataIcon?: string;
	name: IconName | null;
	onClick?: React.MouseEventHandler<SVGSVGElement>;
	size?: IconSize;
}

export enum IconSize {
	XXS = 12,
	XS = 15,
	S = 24
}

interface StyledIconProps {
	className?: string;
	iconColor?: Color;
	size?: IconSize;
}

interface IconRegistrySymbolProps {
	id: string;
}

const icons: { readonly [key: string]: JSX.Element[][] | JSX.Element[] } = {
	[IconName.ArrowRight]: [
		[
			<path
				key="arrowRight"
				d="M17.5 12l-8.486 8.485L7.6 19.071 14.671 12 7.6 4.929l1.414-1.414z"
			/>
		]
	],
	[IconName.ArrowLeft]: [
		[
			<path
				key="arrowLeft"
				d="M7.5 12 15.986 3.515 17.4 4.929 10.329 12 17.4 19.071 15.986 20.485z"
			/>
		]
	],
	[IconName.ArrowFillRight]: [[<path key="arrowFillRight" d="M8 4l8 8-8 8z" />]],
	[IconName.ArrowFillLeft]: [[<path key="arrowFillLeft" d="M16 20l-8-8 8-8v16z" />]],
	[IconName.Robo]: [
		[<path key="robo" d="M0 0h24v24H0V0zm15 5v5h5V5h-5zM4 20h16v-1H4v1zM4 5v5h5V5H4z" />]
	],
	[IconName.Pattern]: [
		[
			<path
				key="pattern"
				d="M6 15h5v2H6v-2zm0-8h10v1H6V7zm0 3h7v1H6v-1zM4 5v14h16V5H4zm0-1h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
			/>
		]
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
	stroke-miterlimit: 10;

	@media (max-resolution: 124dpi) {
		stroke-width: 1.2px;
	}
`;

const IconRegistrySymbol: React.StatelessComponent<IconRegistrySymbolProps> = props => (
	<symbol id={`${props.id}`} viewBox="0 0 24 24">
		{props.children}
	</symbol>
);

export const IconRegistry: React.StatelessComponent<IconRegistryProps> = (props): JSX.Element => (
	<StyledIconRegistry>
		{reduce(props.names, (name, e) => {
			const iconReg = icons[e];

			return [
				<IconRegistrySymbol id={name} key={`${name}`}>
					{iconReg}
				</IconRegistrySymbol>
			];
		})}
	</StyledIconRegistry>
);

function getIconRef(name: string): string {
	return `#${name}`;
}

export const Icon: React.StatelessComponent<IconProps> = (props): JSX.Element => {
	const icon = typeof props.name === 'number' ? IconName[props.name] : null;
	return (
		<StyledIcon
			onClick={props.onClick}
			className={props.className}
			iconColor={props.color}
			size={props.size}
			data-icon={props.dataIcon}
		>
			{icon !== null && <use xlinkHref={getIconRef(icon)} />}
		</StyledIcon>
	);
};

export function reduce(
	e: typeof IconName,
	cb: (name: string, e: number) => JSX.Element[]
): JSX.Element[] {
	const results: JSX.Element[] = [];
	for (const name in e) {
		if (isNaN(Number(name))) {
			results.push(...cb(name, Number(e[name])));
		}
	}

	return results;
}
