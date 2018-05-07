import { FloatingButton } from '../../lsg/patterns/floating-button';
import { Icon, IconName } from '../../lsg/patterns/icons';
import { EditState } from '../../store/page/page-ref';
import * as React from 'react';
import Space, { SpaceSize } from '../../lsg/patterns/space';
import { Store } from '../../store/store';
import styled from 'styled-components';

export class PageAddButton extends React.Component {
	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		e.preventDefault();
		const store = Store.getInstance();
		const page = store.addNewPageRef();
		store.openPage(page.getId());
		page.setNameState(EditState.Editing);
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
