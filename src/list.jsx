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

const createList = content => (
	<List>
		{
			content.map(({label, children, active}, i) => {
				const nextLevel = children ? createList(children) : null;
				return (<ListItem key={i} className={active ? 'active' : ''}>
					{label}
					{nextLevel}
				</ListItem>)
			})
		}
	</List>
)

/**
 * Property 'content':
 * [{
 *   'label': 'My first project',
 *   'active': true,
 *   'children': [
 *     {
 *       'label': 'My first project',
 *       'active': true,
 *       'children': []
 *     }
 *   ]
 * }]
 */

const ListComponent = props => createList(props.content);

export default ListComponent;
