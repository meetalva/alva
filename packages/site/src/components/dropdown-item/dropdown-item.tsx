import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { fonts } from '../fonts';

export interface DropdownItemProps {
	/** @name Content text @default Dropdown Item */ content: string;
}

const StyledDropdownItem = styled.div`
	display: flex;
	padding: 17px 22px;
	border-top: 1px solid ${Color.Grey70.toString()};
	font-family: ${fonts().NORMAL_FONT};

	&:hover {
		color: ${Color.Black.toString()};
	}
`;

export const DropdownItem: React.StatelessComponent<DropdownItemProps> = props => {
	return <StyledDropdownItem>{props.content}</StyledDropdownItem>;
};
