import { Color, colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size as SpaceSize } from '../space';
import styled from 'styled-components';

export interface DropdownItemProps {
	// active?: boolean;
	color?: Color;
	name: string;
	icon?: IconName;
	handleClick?: React.MouseEventHandler<HTMLElement>;
}

export interface StyledDropdownItemLinkProps {
	color?: Color;
	handleClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledDropdownItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: ${getSpace(SpaceSize.S)}px;

	:last-child {
		margin-bottom: 0;
	}
`;

const StyledDropdownItemLink = styled.a`
	display: flex;
	align-items: center;
	flex-grow: 1;
	font-size: 12px;
	cursor: pointer;
	${(props: StyledDropdownItemLinkProps) =>
		props.color ? `color: ${props.color.toString()}` : 'color: inherit'};

	:hover {
		color: ${colors.blueLight.toString()};
	}
`;

const StyledDropdownItemIcon = styled(Icon)`
	margin-right: ${getSpace(SpaceSize.XS)}px;
`;

const StyledDropdownItemLinkAttribute = styled.div`
	display: none;
	${StyledDropdownItem}:hover & {
		display: flex;
	}
`;

const StyledDropdownItemLinkAttributeItem = styled.a`
	font-size: 10px;
	color: ${colors.grey70.toString()};
	margin-right: ${getSpace(SpaceSize.XXS)}px;
	cursor: pointer;

	:hover {
		color: ${colors.blueLight.toString()};
	}
`;

export default class DropdownItem extends React.Component<DropdownItemProps> {
	public render(): JSX.Element {
		return (
			<StyledDropdownItem>
				<StyledDropdownItemLink handleClick={this.props.handleClick}>
					{this.props.icon && (
						<StyledDropdownItemIcon size={IconSize.XXS} name={this.props.icon} />
					)}
					{this.props.name}
				</StyledDropdownItemLink>
				{this.props.children}
			</StyledDropdownItem>
		);
	}
}

export class DropdownItemLinkAttribute extends React.Component<{}> {
	public render(): JSX.Element {
		return (
			<StyledDropdownItemLinkAttribute>{this.props.children}</StyledDropdownItemLinkAttribute>
		);
	}
}

export class DropdownItemLinkAttributeItem extends React.Component<{}> {
	public render(): JSX.Element {
		return (
			<StyledDropdownItemLinkAttributeItem>
				{this.props.children}
			</StyledDropdownItemLinkAttributeItem>
		);
	}
}
