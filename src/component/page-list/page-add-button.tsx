import * as Sender from '../../message/client';
import { FloatingButton } from '../../lsg/patterns/floating-button';
import { Icon, IconName } from '../../lsg/patterns/icons';
import { ServerMessageType } from '../../message';
import * as React from 'react';
import Space, { SpaceSize } from '../../lsg/patterns/space';
import styled from 'styled-components';
import * as uuid from 'uuid';

export class PageAddButton extends React.Component {
	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		e.preventDefault();
		Sender.send({
			id: uuid.v4(),
			payload: undefined,
			type: ServerMessageType.CreateNewPage
		});
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
