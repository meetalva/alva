import { Color } from '../colors';
import { Copy } from '../copy';
import { IconSize } from '../icons';
import * as React from 'react';
import { Plus } from 'react-feather';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface AddPageButtonProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledAddPageButton = styled.button`
	position: relative;
	box-sizing: border-box;
	height: 60px;
	width: 100%;
	border: 1px solid ${Color.Grey80};
	border-radius: 6px;
	background-color: transparent;
	margin: ${getSpace(SpaceSize.XS)}px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: border 0.2s;
	user-select: none;

	&:focus {
		outline: none;
	}

	&:hover {
		border: 1px solid ${Color.Grey60};
	}
`;

const StyledIcon = styled(Plus)`
	margin-right: ${getSpace(SpaceSize.XS)}px;
`;

export const AddPageButton: React.SFC<AddPageButtonProps> = props => (
	<StyledAddPageButton onClick={props.onClick}>
		<StyledIcon size={IconSize.XS} color={Color.Grey50} />
		<Copy textColor={Color.Grey50}>Add Page</Copy>
	</StyledAddPageButton>
);
