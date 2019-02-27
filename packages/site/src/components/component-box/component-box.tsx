import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { Copy, CopySize } from '../copy';

export interface ComponentBoxProps {
	children?: React.ReactNode;
	title: string;
	view: ComponentBoxView;
}

export enum ComponentBoxView {
	Design,
	Code
}

const StyledBox = styled.div`
	width: 200px;
	height: 200px;
	box-sizing: border-box;
	padding: 20px;
	background: ${Color.Grey95};
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	border-radius: 3px;
`;

const StyledContent = styled.div`
	display: flex;
	flex: 1 1 auto;
	align-items: center;
	justify-content: center;
`;

const StyledTitle = styled.div`
	width: 100%;
	flex: 0 1 auto;
	text-align: center;
`;

export const ComponentBox: React.StatelessComponent<ComponentBoxProps> = (props): JSX.Element => {
	return (
		<StyledBox>
			<StyledContent>{props.children}</StyledContent>
			<StyledTitle>
				<Copy size={CopySize.Small} color={Color.Grey50}>
					{props.title}
				</Copy>
			</StyledTitle>
		</StyledBox>
	);
};
