import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';
import { ChevronLeft, ChevronRight, X, Check } from 'react-feather';

export interface TutorialProps {
	onLeftClick?: React.MouseEventHandler;
	onRightClick?: React.MouseEventHandler;
	onFinishClick?: React.MouseEventHandler;
	progress: number;
	children?: React.ReactNode;
}

const StyledWrapper = styled.div`
	background: ${Color.Grey10};
	display: flex;
	padding: ${getSpace(SpaceSize.XXXL)}px ${getSpace(SpaceSize.XXL)}px;
	align-items: center;
	justify-content: space-between;
	user-select: none;
`;

const IconWrapper = styled.div`
	width: ${getSpace(SpaceSize.XL)}px;
`;

const StyledContainer = styled.div`
	text-align: center;
	color: ${Color.White};
	max-width: 360px;
`;

const StyledProgress = styled.div`
	position: relative;
	display: inline-block;
	width: 120px;
	height: 4px;
	border-radius: 2px;
	background: ${Color.Grey20};
	margin-top: ${getSpace(SpaceSize.L)}px;

	&:after {
		content: '';
		position: absolute;
		display: block;
		left: 0;
		top: 0;
		width: ${(props: TutorialProps) => props.progress * 100}%;
		height: 100%;
		border-radius: 2px;
		background: ${Color.Grey60};
		transition: width 0.5s;
	}
`;

export const Tutorial: React.StatelessComponent<TutorialProps> = props => (
	<StyledWrapper>
		<IconWrapper>
			{props.onLeftClick ? (
				<ChevronLeft color={Color.White} onClick={props.onLeftClick} />
			) : (
				<X color={Color.White} onClick={props.onFinishClick} />
			)}
		</IconWrapper>
		<StyledContainer onClick={props.onRightClick}>
			{props.children}
			<StyledProgress progress={props.progress} />
		</StyledContainer>
		<IconWrapper>
			{props.onRightClick ? (
				<ChevronRight color={Color.White} onClick={props.onRightClick} />
			) : (
				<Check color={Color.White} onClick={props.onFinishClick} />
			)}
		</IconWrapper>
	</StyledWrapper>
);
