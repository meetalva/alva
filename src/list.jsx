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
`;


class ListComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<List>
				<ListItem active={true}>
					My first project
					<List>
						<ListItem active={true}>
							My page
						</ListItem>
						<ListItem>
							Another page
						</ListItem>
						<ListItem>
							A fanstastic page
						</ListItem>
					</List>
				</ListItem>
				<ListItem>
					Checkout process
					<List>
						<ListItem>
							Start page
						</ListItem>
						<ListItem>
							Confirmation page
						</ListItem>
						<ListItem>
							Thank-you page
						</ListItem>
					</List>
				</ListItem>
			</List>
		);
	}
}

export default ListComponent;
