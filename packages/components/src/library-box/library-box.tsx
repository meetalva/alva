// tslint:disable-next-line:no-submodule-imports
import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { Headline } from '../headline';
import { Copy, CopySize } from '../copy';
import { getSpace, SpaceSize, Space } from '../space';
import { LibraryImage } from './library-image';
import * as ColorTool from 'color';

export enum LibraryBoxState {
	Idle,
	Progress
}

export enum LibraryBoxSize {
	Medium,
	Large
}

export interface LibraryBoxProps {
	color?: string;
	image?: string;
	name?: string;
	description?: string;
	details?: React.ReactNode;
	install?: React.ReactNode;
	version?: React.ReactNode;
	state: LibraryBoxState;
	size: LibraryBoxSize;
}

const StyledBox =
	styled.div <
	LibraryBoxProps >
	`
	width: 348px;
	background: ${props => (props.color ? props.color : Color.Grey20)};
	border-radius: 6px;
	box-shadow: 0 0 24px 0 ${props =>
		props.color ? new ColorTool(props.color).fade(0.4).toString() : Color.BlackAlpha15};
	color: ${Color.White};
	text-align: left;
	margin: ${getSpace(SpaceSize.S)}px ${getSpace(SpaceSize.XS)}px;
	user-select: none;
	overflow: hidden;

	animation: show .2s ease-out both;

	:nth-child(2) {
		animation-delay: 0.05s;
	}
	:nth-child(3) {
		animation-delay: 0.1s;
	}
	:nth-child(4) {
		animation-delay: 0.15s;
	}
	:nth-child(5) {
		animation-delay: 0.2s;
	}
	:nth-child(6) {
		animation-delay: 0.25s;
	}

	@keyframes show {
		from {
			transform: scale(.95);
			opacity: 0;
		}
		to {
			transform: scale(1)
			opacity: 1 !important;
		}
	}
`;

const IMAGE = (props: LibraryBoxProps) => (props.image ? props.image : toDataUrl(<LibraryImage />));

const StyledImage = styled.div`
	height: 140px;
	width: 100%;
	background-image: url('${IMAGE}');
	background-size: cover;
	background-position: center;
	border-radius: 6px 6px 0 0;
`;

const StyledDetails = styled.div`
	min-height: 200px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	box-sizing: border-box;
`;

const Translucent = styled.div`
	opacity: 0.75;
`;

const StyledInstallContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`;

const StyledTop = styled.div`
	padding: ${getSpace(SpaceSize.L)}px ${getSpace(SpaceSize.XL)}px 0;
`;

const StyledBottom = styled.div`
	position: relative;
	padding: 0 ${getSpace(SpaceSize.XL)}px;
	border-radius: 0 0 6px 6px;
`;

export const LibraryBox: React.StatelessComponent<LibraryBoxProps> = (props): JSX.Element => (
	<StyledBox {...props}>
		{props.size === LibraryBoxSize.Large && (
			<StyledImage state={props.state} image={props.image} size={props.size} />
		)}
		<StyledDetails {...props}>
			<StyledTop>
				<Headline order={4}>{props.name}</Headline>
				<Space sizeBottom={SpaceSize.XS} />
				<Translucent>
					<Copy size={CopySize.M}>{props.description}</Copy>
					<Space sizeBottom={SpaceSize.XS + SpaceSize.XXS} />
					{props.details}
				</Translucent>
				<Space sizeBottom={SpaceSize.S} />
			</StyledTop>
			<StyledBottom {...props}>
				<Space sizeTop={SpaceSize.L} />
				<StyledInstallContainer>
					{props.install}
					<Translucent>{props.version}</Translucent>
				</StyledInstallContainer>
				<Space sizeBottom={SpaceSize.L} />
			</StyledBottom>
		</StyledDetails>
	</StyledBox>
);

function toDataUrl(element: JSX.Element): string {
	const svg = ReactDOMServer.renderToString(element);
	return `data:image/svg+xml;utf8,${svg}`;
}
