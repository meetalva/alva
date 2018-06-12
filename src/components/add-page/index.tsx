import * as React from 'react';
import { Color } from '../colors';
import { Copy } from '../copy';
import { getSpace, SpaceSize } from '../space';
import { Icon, IconName, IconSize } from '../icons';
import styled from 'styled-components';

export interface AddPageProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledAddPage = styled.button`
	position: relative;
	box-sizing: border-box;
	height: 60px;
	width: 100%;
	border: 1px solid ${Color.Grey80};
	border-radius: 6px;
	background-color: transparent;
	margin: ${getSpace(SpaceSize.S)}px;
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

const StyledIcon = styled(Icon)`
	margin-right: ${getSpace(SpaceSize.XS)}px;
`;

export const AddPage: React.SFC<AddPageProps> = props => (
	<StyledAddPage onClick={props.onClick}>
		<StyledIcon name={IconName.Plus} size={IconSize.XS} color={Color.Grey60} />
		<Copy textColor={Color.Grey50}>Add Page</Copy>
	</StyledAddPage>
);
