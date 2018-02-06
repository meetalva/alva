import { Color, colors } from '../colors';

import { Icon, IconName, Size as IconSize } from '../icons';
import Input, { InputTypes } from '../input';
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
}

export interface DropdownItemEditableProps {
	color?: Color;
	editable?: boolean;
	name: string;
	icon?: IconName;
	handleClick?: React.MouseEventHandler<HTMLElement>;
	handleDoubleClick?: React.MouseEventHandler<HTMLElement>;
	handleKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
}

export interface StyledDropdownItemLinkProps {
	color?: Color;
}

const StyledDropdownItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const StyledDropdownItemLink = styled.a`
	display: flex;
	align-items: center;
	flex-grow: 1;
	padding-bottom: ${getSpace(SpaceSize.S)}px;
	font-size: 12px;
	cursor: pointer;
	${(props: StyledDropdownItemLinkProps) =>
		props.color ? `color: ${props.color.toString()}` : 'color: inherit'};

	:hover {
		color: ${colors.blue40.toString()};
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
	color: ${colors.grey60.toString()};
	margin-right: ${getSpace(SpaceSize.XXS)}px;
	cursor: pointer;

	:hover {
		color: ${colors.blue40.toString()};
	}
`;

export default class DropdownItem extends React.Component<DropdownItemProps> {
	public render(): JSX.Element {
		return (
			<StyledDropdownItem>
				<StyledDropdownItemLink onClick={this.props.handleClick}>
					{this.props.icon && (
						<StyledDropdownItemIcon size={IconSize.S} name={this.props.icon} />
					)}
					{this.props.name}
				</StyledDropdownItemLink>
				{this.props.children}
			</StyledDropdownItem>
		);
	}
}

export class DropdownItemLinkAttribute extends React.Component {
	public render(): JSX.Element {
		return (
			<StyledDropdownItemLinkAttribute>{this.props.children}</StyledDropdownItemLinkAttribute>
		);
	}
}

export class DropdownItemLinkAttributeItem extends React.Component {
	public render(): JSX.Element {
		return (
			<StyledDropdownItemLinkAttributeItem>
				{this.props.children}
			</StyledDropdownItemLinkAttributeItem>
		);
	}
}

export const DropdownItemEditableLink: React.StatelessComponent<DropdownItemEditableProps> = (
	props
): JSX.Element => (
	<StyledDropdownItem onDoubleClick={props.handleDoubleClick}>
		{!props.editable ? (
			<StyledDropdownItemLink onClick={props.handleClick}>
				{props.icon && <StyledDropdownItemIcon size={IconSize.S} name={props.icon} />}
				{props.name}
			</StyledDropdownItemLink>
		) : (
			<Input
				handleKeyDown={props.handleKeyDown}
				placeholder="rename page"
				type={InputTypes.string}
			/>
		)}
	</StyledDropdownItem>
);
