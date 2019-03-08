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
	FlexAlignStart: <path d="M1 .5h22M5 2h6v12H5zM13 2h6v9h-6z" />,
	FlexAlignCenter: <path d="M1 12.5h22M5 6h6v12H5zM13 8h6v9h-6z" />,
	FlexAlignEnd: <path d="M1 23.5h22M5 10h6v12H5zM13 13h6v9h-6z" />,
	FlexAlignStretch: <path d="M5 2h6v20H5zM1 23.5h22M13 2h6v20h-6zM1 .5h22" />,
	FlexJustifyStart: <path d="M.5 2v20M2 6h6v12H2zM10 6h6v12h-6z" />,
	FlexJustifyCenter: <path d="M23.5 2v20M8 6h6v12H8zM16 6h6v12h-6z" />,
	FlexJustifyEnd: <path d="M12.5 2v20M5 6h6v12H5zM14 6h6v12h-6z" />,
	FlexJustifySpaceBetween: <path d="M.5 2v20M23.5 2v20M2 6h6v12H2zM16 6h6v12h-6z" />,
	FlexJustifySpaceAround: <path d="M.5 2v20M23.5 2v20M4 6h6v12H4zM14 6h6v12h-6z" />,
	FlexNoGrowOrShrink: (
		<path d="M4.5 4v16M19.5 4v16M7.646 16.646l8.486-8.485M16.132 16.839L7.646 8.354" />
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
	if (Object.keys(LocalIcons).includes(props.icon)) {
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
