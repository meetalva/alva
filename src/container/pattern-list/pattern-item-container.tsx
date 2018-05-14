import { PatternAnchor, PatternListItem } from '../../components';
import { Pattern } from '../../model';
import * as React from 'react';

export interface PatternItemContainerContainerProps {
	pattern: Pattern;
}

export class PatternItemContainer extends React.Component<PatternItemContainerContainerProps> {
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
				onDragStart={e => this.handleDragStart(e)}
			>
				{props.pattern.getName()}
			</PatternListItem>
		);
	}
}
