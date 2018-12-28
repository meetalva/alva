import { ElementContainer } from './element-container';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';

export interface ElementContentContainerProps {
	content: Model.ElementContent;
}

@MobxReact.observer
export class ElementContentContainer extends React.Component<ElementContentContainerProps> {
	public render(): JSX.Element | null {
		const { props } = this;
		return (
			<div style={{ paddingBottom: 2 }}>
				{props.content
					.getElements()
					.map(element => <ElementContainer key={element.getId()} element={element} />)}
			</div>
		);
	}
}
