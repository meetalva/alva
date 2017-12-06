import { colors } from '../../lsg/patterns/colors';
import { Headline } from '../../lsg/patterns/headline';
import * as React from 'react';
import styledComponents from 'styled-components';

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
	cursor: pointer;

	&.active {
		background: #def;
	}
`;

const Label = styledComponents.span`
	color: ${colors.black.toString()};
	padding-right 4px;
`;

const Value = styledComponents.span`
	color: ${colors.black.toString()};
`;

export interface ListProps {
	items: ListPropsListItem[];
	headline: string;
}

export interface ListPropsListItem {
	active?: boolean;
	children?: ListPropsListItem[];
	label?: string;
	value: string;

	onClick?(event: {}): void;
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
				{this.createList(this.props.items)}
			</div>
		);
	}

	public createList(items: ListPropsListItem[]): JSX.Element {
		return (
			<Ul>
				{items.map((item: ListPropsListItem, index: number) => {
					const labelComponent = item.label ? <Label>{item.label}:</Label> : null;
					const nextLevel = item.children ? this.createList(item.children) : null;

					return (
						<Li key={index} className={item.active ? 'active' : ''} onClick={item.onClick}>
							{labelComponent}
							<Value>{item.value}</Value>
							{nextLevel}
						</Li>
					);
				})}
			</Ul>
		);
	}
}
