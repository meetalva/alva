import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export enum IconName {
	ArrowFillRight,
	ArrowFillLeft,
	Robo
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
	[IconName.ArrowFillRight]: [[<path key="arrowFillRight" d="M8 4l8 8-8 8z" />]],
	[IconName.ArrowFillLeft]: [[<path key="arrowFillLeft" d="M16 20l-8-8 8-8v16z" />]],
	[IconName.Robo]: [
		[<path key="robo" d="M0 0h24v24H0V0zm15 5v5h5V5h-5zM4 20h16v-1H4v1zM4 5v5h5V5H4z" />]
	]
};

const StyledIconRegistry = styled.svg`
	display: none;
`;

const StyledIcon = styled.svg`
	width: ${(props: StyledIconProps) => props.size || IconSize.S}px;
	height: ${(props: StyledIconProps) => props.size || IconSize.S}px;

	color: ${(props: StyledIconProps) => (props.iconColor ? props.iconColor : 'inherit')};
	fill: currentColor;
	stroke: none;
	stroke-miterlimit: 10;
`;

const IconRegistrySymbol: React.StatelessComponent<IconRegistrySymbolProps> = props => (
	<symbol id={`${props.id}`} viewBox="0 0 24 24">
		{props.children}
	</symbol>
);

export const IconRegistry: React.StatelessComponent = (): JSX.Element => (
	<StyledIconRegistry>
		{reduce(IconName, (name, e) => {
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
