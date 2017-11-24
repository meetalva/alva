import React from 'react';
import styled, { css } from 'styled-components';


const Headline = styled.h1`
	padding: 4px 0px 4px 14px;
	margin: 0 0 4px;
	width: calc(100% - 14px);
	font-size: 14px;
	background: #444;
	color: #fff;
`;

const List = styled.ul`
	padding: 0;
	margin: 0;
	width: 100%;
`;

const ListItem = styled.li`
	margin: 0 0 0 15px;
	padding: 0;
	line-height: 25px;
	list-style: none;
	cursor: pointer;

	&.active {
		background: #def;
	}
`;

const Label = styled.span`
	color: #00F;
	padding-right 4px;
`;

const Value = styled.span`
	color: #000;
`;

/**
 * Property 'content':
 * [{
 *   'label': 'Project',
 *   'value': 'My first project',
 *   'active': true,
 *   'children': [
 *     {
 *       'label': 'Project',
 *       'value': 'My first project',
 *       'active': true,
 *       'children': []
 *     }
 *   ]
 * }]
 */
class ListComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<Headline key="headline">{this.props.headline}</Headline>
				{this.createList(this.props.content)}
			</div>
		);
	}

	createList(content) {
		return (
			<List>
				{
					content.map(({label, value, children, active}, i) => {
						const labelComponent = label ? <Label>{label}:</Label> : null;
						const nextLevel = children ? this.createList(children) : null;
						return (
							<ListItem key={i} className={active ? 'active' : ''}>
								{labelComponent}
								<Value>{value}</Value>
								{nextLevel}
							</ListItem>
						)
					})
				}
			</List>
		);
	}
}

export default ListComponent;
