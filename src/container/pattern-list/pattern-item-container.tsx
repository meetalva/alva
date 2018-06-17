import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import { Pattern } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface PatternItemContainerContainerProps {
	pattern: Pattern;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PatternItemContainer extends React.Component<PatternItemContainerContainerProps> {
	private handleDoubleClick(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as PatternItemContainerContainerProps & { store: ViewStore };
		const element = store.createElement({ pattern: this.props.pattern });

		const getTargetElement = () => {
			const selectedElement = store.getSelectedElement();

			if (selectedElement) {
				return selectedElement;
			}

			const page = store.getActivePage();

			if (page) {
				return page.getRoot();
			}

			return undefined;
		};

		const targetElement = getTargetElement();

		if (element && targetElement) {
			store.addElement(element);
			store.executeElementInsertAfter({ element, targetElement });
		}
	}

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as PatternItemContainerContainerProps & { store: ViewStore };
		const element = store.createElement({ pattern: this.props.pattern, dragged: true });
		store.addElement(element);
	}

	public render(): JSX.Element | null {
		const { props } = this;

		return (
			<Components.PatternListItem
				key={props.pattern.getId()}
				draggable
				onDoubleClick={e => this.handleDoubleClick(e)}
				onDragStart={e => this.handleDragStart(e)}
			>
				<Components.PatternItemLabel>{props.pattern.getName()}</Components.PatternItemLabel>
				<Components.PatternItemDescription>
					{props.pattern.getDescription()}
				</Components.PatternItemDescription>
			</Components.PatternListItem>
		);
	}
}
