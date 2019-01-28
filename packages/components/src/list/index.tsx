import { Color } from '../colors';
import { Headline } from '../headline';
import * as React from 'react';
import styled from 'styled-components';

export interface ListProps {
	headline?: string;
}

export interface ListItemProps {
	active?: boolean;
	children?: ListItemProps[];
	draggable?: boolean;
	label?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onContextMenu?: React.MouseEventHandler<HTMLElement>;
	onDragDrop?: React.DragEventHandler<HTMLElement>;
	onDragDropForChild?: React.DragEventHandler<HTMLElement>;
	onDragStart?: React.DragEventHandler<HTMLElement>;
	title: string;
}

interface StyledListItemProps {
	active?: boolean;
	draggable?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDragStart?: React.DragEventHandler<HTMLElement>;
}

export interface LiProps {
	active?: boolean;
	draggable?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDragStart?: React.DragEventHandler<HTMLElement>;
}

const StyledUl = styled.ul`
	box-sizing: border-box;
	padding: 0;
	margin: 0;
	width: 100%;
`;

const StyledLi = styled.li`
	line-height: 25px;
	list-style: none;
	${(props: StyledListItemProps) => (props.onClick ? 'cursor: pointer;' : '')};
	${(props: StyledListItemProps) => (props.active ? `background: ${Color.Blue80}` : '')};
`;

const StyledLabel = styled.span`
	color: ${Color.Black};
	padding-right: 4px;
`;

const StyledValue = styled.span`
	color: ${Color.Black};
`;

export class Ul extends React.Component {
	public render(): JSX.Element {
		return <StyledUl>{this.props.children}</StyledUl>;
	}
}

export class Li extends React.Component<LiProps> {
	public constructor(props: LiProps) {
		super(props);
	}

	public render(): JSX.Element {
		const { active, draggable, onClick, onDragStart } = this.props;
		return (
			<StyledLi
				active={active}
				draggable={draggable}
				onClick={onClick}
				onDragStart={onDragStart}
			>
				{this.props.children}
			</StyledLi>
		);
	}
}

export class Label extends React.Component {
	public render(): JSX.Element {
		return <StyledLabel>{this.props.children}</StyledLabel>;
	}
}

export class Value extends React.Component {
	public render(): JSX.Element {
		return <StyledValue>{this.props.children}</StyledValue>;
	}
}

export class List extends React.Component<ListProps> {
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
