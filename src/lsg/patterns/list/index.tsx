import { colors } from '../colors';
import { Headline } from '../headline';
import * as React from 'react';
import styledComponents from 'styled-components';

export interface ListProps {
	items: ListItemProps[];
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
	draggable?: boolean;
}

interface StyledListItemProps {
	active?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	handleDragStart?: React.DragEventHandler<HTMLElement>;
	draggable?: boolean;
}

const Ul = styledComponents.ul`
	padding: 0;
	margin: 0;
	width: 100%;
`;

const Li = styledComponents.li`
	margin: 0 0 0 15px;
	padding: 0;
	line-height: 25px;
	list-style: none;
	${(props: StyledListItemProps) => (props.onClick ? 'cursor: pointer;' : '')}
	${(props: StyledListItemProps) => (props.active ? 'background: #def' : '')}
`;

const Label = styledComponents.span`
	color: ${colors.black.toString()};
	padding-right 4px;
`;

const Value = styledComponents.span`
	color: ${colors.black.toString()};
`;

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
				{this.createList(this.props.items)}
			</div>
		);
	}

	public createList(items: ListItemProps[]): JSX.Element {
		return (
			<Ul>
				{items.map((props: ListItemProps, index: number) => {
					const labelComponent = props.label ? <Label>{props.label}:</Label> : null;
					const nextLevel = props.children ? this.createList(props.children) : null;

					return (
						<Li
							draggable={props.draggable}
							onDragStart={props.handleDragStart}
							key={index}
							active={props.active}
							onClick={props.onClick}
						>
							{labelComponent}
							<Value>{props.value}</Value>
							{nextLevel}
						</Li>
					);
				})}
			</Ul>
		);
	}
}
