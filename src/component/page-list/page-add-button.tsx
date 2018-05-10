import { FloatingButton } from '../../lsg/patterns/floating-button';
import { Icon, IconName } from '../../lsg/patterns/icons';
import * as React from 'react';
import Space, { SpaceSize } from '../../lsg/patterns/space';
import { ViewStore } from '../../store';
import styled from 'styled-components';
import * as Types from '../../store/types';

export class PageAddButton extends React.Component {
	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		e.preventDefault();
		const store = ViewStore.getInstance();
		const page = store.addNewPage();

		if (page) {
			store.setActivePage(page);
			page.setNameState(Types.EditState.Editing);
		}
	}

	public render(): JSX.Element {
		return (
			<FixedContainer>
				<FloatingButton
					icon={<Icon name={IconName.Plus} />}
					onClick={e => this.handleClick(e)}
				/>
			</FixedContainer>
		);
	}
}

const FixedContainer = styled(Space)`
	position: fixed;
	bottom: ${SpaceSize.XXL}px;
	right: ${SpaceSize.XXXL}px;
`;
