import { colors } from '../colors';
import { Headline } from '../headline';
import * as React from 'react';
import styledComponents from 'styled-components';

export interface ListProps {
	headline: string;
}

export interface ListItemProps {
	active?: boolean;
	children?: ListItemProps[];
	label?: string;
	value: string;

	onClick?: React.MouseEventHandler<HTMLElement>;
	handleDragStart?: React.DragEventHandler<HTMLElement>;
	handleDragDrop?: React.DragEventHandler<HTMLElement>;
	handleDragDropForChild?: React.DragEventHandler<HTMLElement>;
	draggable?: boolean;
}

interface StyledListItemProps {
	active?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	handleDragStart?: React.DragEventHandler<HTMLElement>;
	draggable?: boolean;
}

const StyledUl = styledComponents.ul`
	box-sizing: border-box;
	padding: 0 0 0 15px;
	margin: 0;
	width: 100%;
`;

const StyledLi = styledComponents.li`
	line-height: 25px;
	list-style: none;
	${(props: StyledListItemProps) => (props.onClick ? 'cursor: pointer;' : '')}
	${(props: StyledListItemProps) => (props.active ? 'background: #def' : '')}
`;

const StyledLabel = styledComponents.span`
	color: ${colors.black.toString()};
	padding-right 4px;
`;

const StyledValue	 = styledComponents.span`
	color: ${colors.black.toString()};
`;

export class Ul extends React.Component<{}> {
	public render(): JSX.Element {
		return (
		<StyledUl>
			{this.props.children}
		</StyledUl>
		);
	}
}

export class Li extends React.Component<{}> {
	public render(): JSX.Element {
		return (
		<StyledLi>
			{this.props.children}
		</StyledLi>
		);
	}
}

export class Label extends React.Component<{}> {
	public render(): JSX.Element {
		return (
		<StyledLabel>
			{this.props.children}
		</StyledLabel>
		);
	}
}

export class Value extends React.Component<{}> {
	public render(): JSX.Element {
		return (
		<StyledValue>
			{this.props.children}
		</StyledValue>
		);
	}
}

export default class List extends React.Component<ListProps> {
	public constructor(props: ListProps) {
		super(props);
	}

	public render(): JSX.Element {
		return (
			<div>
				<Headline order={3} key="headline">
					{this.props.headline}
				</Headline>
				{this.props.children}
			</div>
		);
	}
}
