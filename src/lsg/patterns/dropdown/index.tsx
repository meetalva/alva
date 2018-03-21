import { colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size as SpaceSize } from '../space';
import styled from 'styled-components';

export interface DropdownProps {
	chrome?: boolean;
	handleClick?: React.MouseEventHandler<HTMLElement>;
	label?: string;
	open?: boolean;
	visible?: boolean;
}

export interface StyledChromeDropdownProps {
	open?: boolean;
}

export interface StyledDropdownProps {
	open?: boolean;
}

export interface StyledLabelProps {
	handleClick?: React.MouseEventHandler<HTMLElement>;
	open?: boolean;
}

export interface StyledIconProps {
	open?: boolean;
}

export interface StyledFlyoutProps {
	open?: boolean;
}

const StyledDropdown = styled.div`
	border: 1px solid ${colors.grey90.toString()};
	background: ${colors.white.toString()};
	border-radius: 3px;
`;

const StyledLabel = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: ${getSpace(SpaceSize.S)}px;
	cursor: pointer;
`;

const StyledIcon = styled(Icon)`
	margin-left: ${getSpace(SpaceSize.XS)}px;
	fill: ${colors.grey36.toString()};
	transition: transform 0.2s;

	${(props: StyledIconProps) =>
		props.open ? 'transform: rotate(-90deg)' : 'transform: rotate(90deg)'};
`;

const StyledFlyout = styled.div`
	${(props: StyledFlyoutProps) => (props.open ? 'display: block' : 'display: none')};
	padding: 0 ${getSpace(SpaceSize.S)}px ${getSpace(SpaceSize.XS)}px;
`;

const StyledChromeDropdown = styled(StyledDropdown)`
	${(props: StyledChromeDropdownProps) => (props.open ? 'display: block' : 'display: none')};
	position: absolute;
	top: 45px;
	left: 50%;
	min-width: 200px;
	padding: ${getSpace(SpaceSize.S)}px ${getSpace(SpaceSize.S)}px ${getSpace(SpaceSize.XS)}px;
	transform: translateX(-50%);
`;

export default class Dropdown extends React.Component<DropdownProps> {
	public render(): JSX.Element {
		if (this.props.chrome) {
			return (
				<StyledChromeDropdown open={this.props.open}>
					{this.props.children}
				</StyledChromeDropdown>
			);
		}
		return (
			<StyledDropdown>
				<StyledLabel onClick={this.props.handleClick}>
					{this.props.label}
					<StyledIcon name={IconName.Arrow} size={IconSize.XXS} open={this.props.open} />
				</StyledLabel>
				<StyledFlyout open={this.props.open}>{this.props.children}</StyledFlyout>
			</StyledDropdown>
		);
	}
}
