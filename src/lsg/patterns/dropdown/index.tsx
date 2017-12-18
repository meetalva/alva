import { colors } from '../colors';
import * as React from 'react';
import { getSpace, Size as SpaceSize } from '../space';
import styled from 'styled-components';

export interface DropdownProps {
	chrome?: boolean;
	visible?: boolean;
}

export interface StyledDropdownProps {
	visible?: boolean;
}

const StyledDropdown = styled.div`
	${(props: StyledDropdownProps) => (props.visible ? 'display: block' : 'display: none')};
	padding: ${getSpace(SpaceSize.S)}px ${getSpace(SpaceSize.S)}px ${getSpace(SpaceSize.L)}px;
	border: 1px solid ${colors.grey90.toString()};
	background: ${colors.white.toString()};
	border-radius: 3px;
`;

const StyledChromeDropdown = styled(StyledDropdown)`
	position: absolute;
	top: 45px;
	left: 50%;
	min-width: 200px;
	transform: translateX(-50%);
`;

export default class Dropdown extends React.Component<DropdownProps> {
	public render(): JSX.Element {
		if (this.props.chrome) {
			return (
				<StyledChromeDropdown visible={this.props.visible}>
					{this.props.children}
				</StyledChromeDropdown>
			);
		}
		return <StyledDropdown visible={this.props.visible}>{this.props.children}</StyledDropdown>;
	}
}
