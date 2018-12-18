import { Color } from '../colors';
import { Copy } from '../copy';
import { IconSize } from '../icons';
import * as React from 'react';
const { Plus } = require('react-feather');
import { Space, getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface AddButtonProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
	margin?: boolean;
	title?: string;
	disabled?: boolean;
}

const StyledSpace = styled(Space)`
	width: 100%;
`;

const StyledAddButton = styled.button`
	position: relative;
	box-sizing: border-box;
	height: 60px;
	width: 100%;
	border: 1px solid ${Color.Grey90};
	border-radius: 6px;
	background-color: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: border 0.2s;
	opacity ${(props: AddButtonProps) => (props.disabled ? 0.3 : 1)};
	user-select: none;

	&:hover {
		border: 1px solid ${Color.Grey60};
	}

	&:focus {
		outline: none;
	}

	&:active {
		background-color: ${Color.Grey90};
	}
`;

const StyledIcon = styled(Plus)`
	margin-right: ${getSpace(SpaceSize.XS)}px;
`;

export const AddButton: React.SFC<AddButtonProps> = props => (
	<StyledSpace size={props.margin ? SpaceSize.XS : 0} {...props}>
		<StyledAddButton onClick={props.onClick} title={props.title} disabled={props.disabled}>
			<StyledIcon size={IconSize.XS} color={Color.Grey50} />
			<Copy textColor={Color.Grey50}>{props.children}</Copy>
		</StyledAddButton>
	</StyledSpace>
);
