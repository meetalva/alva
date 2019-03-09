import { Color } from '../colors';
import * as React from 'react';
const FeatherIcons = require('react-feather');

export interface IconProps {
	color?: Color;
	icon: string;
	size?: IconSize;
	strokeWidth?: number;
	className?: string;
}

export interface LocalIconProps {
	color?: Color;
	icon: keyof typeof LocalIcons;
	size?: IconSize;
	strokeWidth?: number;
	className?: string;
}

const LocalIcons: { [key: string]: JSX.Element } = {
	FlexAlignStart: (
		<path d="M13.5,5.5 L17.5,5.5 L17.5,12.5 L13.5,12.5 L13.5,5.5 Z M6.5,5.5 L10.5,5.5 L10.5,15.5 L6.5,15.5 L6.5,5.5 Z M1,2.5 L23,2.5 L1,2.5 Z" />
	),
	FlexAlignCenter: (
		<path d="M17.5,11 L17.5,8 L13.5,8 L13.5,11 L10.5,11 L10.5,16 L6.5,16 L6.5,11 L1,11 L6.5,11 L6.5,6 L10.5,6 L10.5,11 L13.5,11 L13.5,14 L17.5,14 L17.5,11 L23,11 L17.5,11 Z" />
	),
	FlexAlignEnd: (
		<path d="M13.5,11.5 L17.5,11.5 L17.5,18.5 L13.5,18.5 L13.5,11.5 Z M6.5,8.5 L10.5,8.5 L10.5,18.5 L6.5,18.5 L6.5,8.5 Z M1,21.5 L23,21.5 L1,21.5 Z" />
	),
	FlexAlignStretch: (
		<path d="M14,5.5 L18,5.5 L18,18.5 L14,18.5 L14,5.5 Z M7,5.5 L11,5.5 L11,18.5 L7,18.5 L7,5.5 Z M1,21.5 L23,21.5 L1,21.5 Z M1,2.5 L23,2.5 L1,2.5 Z" />
	),
	FlexAlignBaseline: (
		<path d="M17.5,11 L17.5,7 L13.5,7 L13.5,11 L10.5,11 L10.5,16 L6.5,16 L6.5,11 L1,11 L6.5,11 L6.5,6 L10.5,6 L10.5,11 L13.5,11 L13.5,13 L17.5,13 L17.5,11 L23,11 L17.5,11 Z" />
	),
	FlexJustifyStart: (
		<path d="M14,5.5 L18,5.5 L18,18.5 L14,18.5 L14,5.5 Z M7,5.5 L11,5.5 L11,18.5 L7,18.5 L7,5.5 Z M4,1 L4,23 L4,1 Z" />
	),
	FlexJustifyCenter: (
		<path d="M15,5.5 L19,5.5 L19,18.5 L15,18.5 L15,5.5 Z M5,5.5 L9,5.5 L9,18.5 L5,18.5 L5,5.5 Z M12,1 L12,23 L12,1 Z" />
	),
	FlexJustifyEnd: (
		<path d="M13,5.5 L17,5.5 L17,18.5 L13,18.5 L13,5.5 Z M6,5.5 L10,5.5 L10,18.5 L6,18.5 L6,5.5 Z M20,1 L20,23 L20,1 Z" />
	),
	FlexJustifySpaceBetween: (
		<path d="M16.5,5.5 L20.5,5.5 L20.5,18.5 L16.5,18.5 L16.5,5.5 Z M3.5,5.5 L7.5,5.5 L7.5,18.5 L3.5,18.5 L3.5,5.5 Z M23.5,1 L23.5,23 L23.5,1 Z M0.5,1 L0.5,23 L0.5,1 Z" />
	),
	FlexJustifySpaceAround: (
		<path d="M14,5.5 L18,5.5 L18,18.5 L14,18.5 L14,5.5 Z M6,5.5 L10,5.5 L10,18.5 L6,18.5 L6,5.5 Z M23.5,1 L23.5,23 L23.5,1 Z M0.5,1 L0.5,23 L0.5,1 Z" />
	)
};

export enum IconSize {
	XXS = 12,
	XS = 15,
	S = 18,
	M = 24
}

export const Icon: React.SFC<LocalIconProps> = (props): JSX.Element => {
	return (
		<svg
			fill="none"
			stroke={props.color || 'currentColor'}
			strokeWidth={props.strokeWidth || 1.5}
			width={props.size || IconSize.M}
			height={props.size || IconSize.M}
			viewBox="0 0 24 24"
		>
			{LocalIcons[props.icon]}
		</svg>
	);
};

export function isIcon(name: string | undefined): boolean {
	if (!name) {
		return false;
	}
	if (Object.keys(LocalIcons).includes(name)) {
		return true;
	}
	if (FeatherIcons.hasOwnProperty(name)) {
		return true;
	}
	return false;
}

export function getIcon(props: IconProps): JSX.Element {
	if (LocalIcons.hasOwnProperty(props.icon)) {
		return <Icon {...props} />;
	}
	if (FeatherIcons.hasOwnProperty(props.icon)) {
		const IconImage = FeatherIcons[props.icon];
		return <IconImage {...props} />;
	}
	return <div>Icon not found</div>;
}

export const Images: { readonly [key: string]: JSX.Element[][] | JSX.Element[] } = {
	EmptyElements: [
		[
			<svg width="66" height="65" key="EmptyElements">
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
				<g fill="none" fillRule="evenodd">
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
