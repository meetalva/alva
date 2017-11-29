import React from 'react';
import styledComponents from 'styled-components';


const Headline = styledComponents.h1`
	padding: 4px 0px 4px 14px;
	margin: 0 0 4px;
	width: calc(100% - 14px);
	font-size: 14px;
	background: #444;
	color: #fff;
`;

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
	color: #00F;
	padding-right 4px;
`;

const Value = styledComponents.span`
	color: #000;
`;


export interface ListProps {
	items: ListPropsListItem[];
	headline: string;
}

export interface ListPropsListItem {
	label?: string;
	value: string;
	active?: boolean;
	children?: ListPropsListItem[];
	onClick?: (event: any) => void
}


export default class List extends React.Component<ListProps> {
	constructor(props: ListProps) {
		super(props);
	}

	render() {
		return (
			<div>
				<Headline key="headline">{this.props.headline}</Headline>
				{this.createList(this.props.items)}
			</div>
		);
	}

	createList(items) {
		const list = this;
		return (
			<Ul>
				{
					items.map((item: ListPropsListItem, index: number) => {
						const labelComponent = item.label ? <Label>{item.label}:</Label> : null;
						const nextLevel = item.children ? this.createList(item.children) : null;

						return (
							<Li key={index} className={item.active ? 'active' : ''} onClick={item.onClick}>
								{labelComponent}
								<Value>{item.value}</Value>
								{nextLevel}
							</Li>
						)
					})
				}
			</Ul>
		);
	}
}
