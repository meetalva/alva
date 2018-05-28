import * as Components from '../../components';
import { ElementContentContainer } from './element-content-container';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';

export interface ElementContainerProps {
	element: Model.Element;
}

@MobxReact.observer
export class ElementContainer extends React.Component<ElementContainerProps> {
	public render(): JSX.Element | null {
		const { props } = this;
		return (
			<Components.Element
				active={props.element.getSelected()}
				draggable={true}
				dragging={true}
				editable={props.element.isNameEditable()}
				highlight={props.element.getHighlighted()}
				highlightPlaceholder={props.element.getPlaceholderHighlighted()}
				id={props.element.getId()}
				mayOpen={props.element.acceptsChildren()}
				open={
					props.element.getOpen() || props.element.getDescendants().some(e => e.getSelected())
				}
				title={props.element.getName()}
			>
				{props.element.getOpen()
					? props.element
							.getContents()
							.map(content => (
								<ElementContentContainer key={content.getId()} content={content} />
							))
					: []}
			</Components.Element>
		);
	}
}
