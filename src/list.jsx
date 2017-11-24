import React from 'react';
import styled, { css } from 'styled-components';



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
		color: red;
	}
`;

const Label = styled.span`
	color: #00F;
	padding-right 4px;
`;

const Value = styled.span`
	color: #000;
`;

const createList = content => (
	<List>
		{
			content.map(({label, value, children, active}, i) => {
				const labelComponent = label ? <Label>{label}:</Label> : null;
				const nextLevel = children ? createList(children) : null;
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
)

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

const ListComponent = props => createList(props.content);

export default ListComponent;
