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
	draggable?: boolean;
}

interface StyledListItemProps {
	active?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	handleDragStart?: React.DragEventHandler<HTMLElement>;
	draggable?: boolean;
}

export const Ul = styledComponents.ul`
	padding: 0;
	margin: 0;
	width: 100%;
`;

export const Li = styledComponents.li`
	margin: 0 0 0 15px;
	padding: 0;
	line-height: 25px;
	list-style: none;
	${(props: StyledListItemProps) => (props.onClick ? 'cursor: pointer;' : '')}
	${(props: StyledListItemProps) => (props.active ? 'background: #def' : '')}
`;

export const Label = styledComponents.span`
	color: ${colors.black.toString()};
	padding-right 4px;
`;

export const Value = styledComponents.span`
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
				{this.props.children}
			</div>
		);
	}
}
