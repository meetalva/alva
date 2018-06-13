import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export enum IconName {
	ArrowRight,
	ArrowLeft,
	ArrowFillRight,
	ArrowFillLeft,
	Check,
	Element,
	Page,
	Plus,
	Pattern,
	Robo,
	Search,
	Uncheck
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
	[IconName.Plus]: [
		[
			<path
				key="plus"
				d="M11,11 L11,2 L13,2 L13,11 L22,11 L22,13 L13,13 L13,22 L11,22 L11,13 L2,13 L2,11 L11,11 Z"
			/>
		]
	],
	[IconName.Pattern]: [
		[
			<path
				key="pattern"
				d="M5 9h14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zm4.16-2H19.5a.5.5 0 1 1 0 1H7.58a.26.26 0 0 1-.08-.5l1.35-.45A1 1 0 0 1 9.16 7z"
			/>
		]
	],
	[IconName.Uncheck]: [
		[
			<path
				key="check"
				d="M14.77 12l4.16 4.16a1.96 1.96 0 0 1-2.77 2.77L12 14.77l-4.16 4.16a1.96 1.96 0 0 1-2.77-2.77L9.23 12 5.07 7.84a1.96 1.96 0 1 1 2.77-2.77L12 9.23l4.16-4.16a1.96 1.96 0 0 1 2.77 2.77L14.77 12z"
			/>
		]
	],
	[IconName.Check]: [
		[
			<path
				key="check"
				d="M8.66 15.2l10.6-10.61A2 2 0 1 1 22.1 7.4L10.07 19.44a2 2 0 0 1-2.83 0L1.6 13.78a2 2 0 1 1 2.82-2.83l4.25 4.24z"
			/>
		]
	],
	[IconName.Search]: [
		[
			<path
				key="check"
				d="M14.89 13.477l6.024 6.023-1.414 1.414-6.023-6.023a6 6 0 1 1 1.414-1.414zm-1.649-1.132a4 4 0 1 0-.896.896l.896-.896z"
			/>
		]
	],
	[IconName.Page]: [
		[
			<path
				key="page"
				d="M6 6h10c.552 0 1 .418 1 .933v12.134c0 .515-.448.933-1 .933H6c-.552 0-1-.418-1-.933V6.933C5 6.418 5.448 6 6 6zm1.5 4a.5.5 0 1 0 0 1h3a.5.5 0 1 0 0-1h-3zm0-2a.5.5 0 0 0 0 1h5a.5.5 0 1 0 0-1h-5zm0 4a.5.5 0 1 0 0 1h6a.5.5 0 1 0 0-1h-6zM19 4.5v13a.5.5 0 1 1-1 0V5H8.5a.5.5 0 0 1 0-1h10a.5.5 0 0 1 .5.5z"
			/>
		]
	],
	[IconName.Element]: [
		[
			<path
				key="element"
				d="M12.757 5.077l7.04 5.28a1 1 0 0 1 0 1.6l-7.04 5.28a1 1 0 0 1-1.2 0l-7.04-5.28a1 1 0 0 1 0-1.6l7.04-5.28a1 1 0 0 1 1.2 0zm7.127 8.63c.151.241.093.557-.133.729l-7.06 5.35a1 1 0 0 1-1.205.002l-7.29-5.494A.494.494 0 0 1 4.1 13.6l.003-.004a.506.506 0 0 1 .705-.095l6.677 5.035a1 1 0 0 0 1.207-.001l6.527-4.951a.459.459 0 0 1 .665.122z"
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
