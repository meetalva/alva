import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export enum IconName {
	ArrowFillRight,
	ArrowFillLeft,
	FlexStart,
	FlexCenter,
	FlexEnd,
	FlexStretch,
	FlexBaseline,
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
	S = 18,
	M = 24
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
	],
	[IconName.FlexStart]: [
		[
			<path
				key="flex-start"
				d="M.75 3h4.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5zm18 0h4.5a.75.75 0 1 1 0 1.5h-4.5a.75.75 0 1 1 0-1.5zM8.5 3h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm5 0h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
			/>
		]
	],
	[IconName.FlexCenter]: [
		[
			<path
				key="flex-center"
				d="M18.75 11.25h4.5a.75.75 0 1 1 0 1.5h-4.5a.75.75 0 1 1 0-1.5zm-18 0h4.5a.75.75 0 1 1 0 1.5H.75a.75.75 0 1 1 0-1.5zM8.5 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm5-4h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
			/>
		]
	],
	[IconName.FlexEnd]: [
		[
			<path
				key="flex-end"
				d="M.75 19.5h4.5a.75.75 0 1 1 0 1.5H.75a.75.75 0 1 1 0-1.5zm18 0h4.5a.75.75 0 1 1 0 1.5h-4.5a.75.75 0 1 1 0-1.5zM8.5 13h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1zm5-8h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"
			/>
		]
	],
	[IconName.FlexStretch]: [
		[
			<path
				key="flex-stretch"
				d="M18.75 19.5h4.5a.75.75 0 1 1 0 1.5h-4.5a.75.75 0 1 1 0-1.5zm-18 0h4.5a.75.75 0 1 1 0 1.5H.75a.75.75 0 1 1 0-1.5zM8.5 3h2a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm5 0h2a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM.75 3h4.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5zm18 0h4.5a.75.75 0 1 1 0 1.5h-4.5a.75.75 0 1 1 0-1.5z"
			/>
		]
	],
	[IconName.FlexBaseline]: [
		[
			<path
				key="flex-baseline"
				d="M.75 11.25h4.5c.41421356 0 .75.3357864.75.75s-.33578644.75-.75.75H.75c-.41421356 0-.75-.3357864-.75-.75s.33578644-.75.75-.75zm18 0h4.5c.4142136 0 .75.3357864.75.75s-.3357864.75-.75.75h-4.5c-.4142136 0-.75-.3357864-.75-.75s.3357864-.75.75-.75zM8.5 9h2c.5522847 0 1 .44771525 1 1v8c0 .5522847-.4477153 1-1 1h-2c-.55228475 0-1-.4477153-1-1v-8c0-.55228475.44771525-1 1-1zm5-5h2c.5522847 0 1 .44771525 1 1v10c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1V5c0-.55228475.4477153-1 1-1zm-4.75 7c-.41421356 0-.75.3357864-.75.75s.33578644.75.75.75h1.5c.4142136 0 .75-.3357864.75-.75s-.3357864-.75-.75-.75h-1.5zm5 0c-.4142136 0-.75.3357864-.75.75s.3357864.75.75.75h1.5c.4142136 0 .75-.3357864.75-.75s-.3357864-.75-.75-.75h-1.5z"
			/>
		]
	]
};

export const Images: { readonly [key: string]: JSX.Element[][] | JSX.Element[] } = {
	EmptyElements: [
		[
			<svg width="66" height="65">
				<defs>
					<rect id="b" width="60" height="22" rx="3" />
					<filter
						x="-8.3%"
						y="-18.2%"
						width="116.7%"
						height="145.5%"
						filterUnits="objectBoundingBox"
						id="a"
					>
						<feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1" />
						<feGaussianBlur
							stdDeviation="1.5"
							in="shadowOffsetOuter1"
							result="shadowBlurOuter1"
						/>
						<feColorMatrix
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
							in="shadowBlurOuter1"
						/>
					</filter>
				</defs>
				<g fill="none" fill-rule="evenodd">
					<path
						d="M37.44.36l-8.43 5.48 7.76 4.56.67-10.04zm-5.5 32.6c-1.74-7.89-1.05-17.85 1.67-25.1l-.93-.35c-2.8 7.43-3.5 17.6-1.7 25.67l.97-.21z"
						fill="#000"
						opacity=".5"
					/>
					<g transform="translate(3 39)">
						<use fill="#000" filter="url(#a)" href="#b" />
						<use fill="#FFF" href="#b" />
						<path fill="#000" opacity=".5" d="M18 6h33v3H18zM18 10h12v3H18z" />
						<circle fill="#000" opacity=".5" cx="9" cy="9" r="3" />
					</g>
				</g>
			</svg>
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
