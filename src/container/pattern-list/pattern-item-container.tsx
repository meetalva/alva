import { PatternAnchor, PatternListItem } from '../../components';
import { Pattern } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface PatternItemContainerContainerProps {
	pattern: Pattern;
}

export class PatternItemContainer extends React.Component<PatternItemContainerContainerProps> {
	private handleDoubleClick(e: React.MouseEvent<HTMLElement>): void {
		const store = ViewStore.getInstance();
		const element = store.addNewElement({ pattern: this.props.pattern });
		const selectedElement = store.getSelectedElement();
		const page = store.getCurrentPage();

		const targetElement = selectedElement ? selectedElement : page ? page.getRoot() : null;

		if (element && targetElement) {
			store.insertAfterElement({ element, targetElement });
		}
	}

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		e.dataTransfer.dropEffect = 'copy';

		e.dataTransfer.setDragImage(
			e.currentTarget.querySelector(`[${PatternAnchor.icon}]`) as Element,
			12,
			12
		);

		e.dataTransfer.setData('patternId', this.props.pattern.getId());
	}

	public render(): JSX.Element | null {
		const { props } = this;
		return (
			<PatternListItem
				key={props.pattern.getId()}
				draggable
				onDoubleClick={e => this.handleDoubleClick(e)}
				onDragStart={e => this.handleDragStart(e)}
			>
				{props.pattern.getName()}
			</PatternListItem>
		);
	}
}
