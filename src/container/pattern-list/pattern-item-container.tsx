import {
	PatternAnchor,
	PatternItemDescription,
	PatternItemLabel,
	PatternListItem
} from '../../components';
import { Pattern } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface PatternItemContainerContainerProps {
	pattern: Pattern;
}

export class PatternItemContainer extends React.Component<PatternItemContainerContainerProps> {
	private handleDoubleClick(e: React.MouseEvent<HTMLElement>): void {
		const store = ViewStore.getInstance();
		const element = store.createElement({ pattern: this.props.pattern });

		const getTargetElement = () => {
			const selectedElement = store.getSelectedElement();

			if (selectedElement) {
				return selectedElement;
			}

			const page = store.getCurrentPage();

			if (page) {
				return page.getRoot();
			}

			return undefined;
		};

		const targetElement = getTargetElement();

		if (element && targetElement) {
			store.addElement(element);
			store.insertAfterElement({ element, targetElement });
		}
	}

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		const store = ViewStore.getInstance();

		const element = store.createElement({ pattern: this.props.pattern, dragged: true });
		store.addElement(element);

		e.dataTransfer.effectAllowed = 'copy';

		e.dataTransfer.setDragImage(
			e.currentTarget.querySelector(`[${PatternAnchor.icon}]`) as Element,
			12,
			12
		);
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
				<PatternItemLabel>{props.pattern.getName()}</PatternItemLabel>
				<PatternItemDescription>{props.pattern.getDescription()}</PatternItemDescription>
			</PatternListItem>
		);
	}
}
