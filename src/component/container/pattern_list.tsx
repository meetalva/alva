import { PatternFolder } from '../../store/pattern/folder';
import { List, ListPropsListItem } from '../presentation/list';
import { observer } from 'mobx-react';
import { Pattern } from '../../store/pattern';
import * as React from 'react';
import { Store } from '../../store';

export interface PatternListProps {
	store: Store;
}

@observer
export class PatternList extends React.Component<PatternListProps> {
	public constructor(props: PatternListProps) {
		super(props);
	}

	public render(): JSX.Element {
		const items: ListPropsListItem[] = this.createItemsFromFolder(
			this.props.store.getPatternRoot() as PatternFolder
		);
		return <List headline="Patterns" items={items} />;
	}

	public createItemsFromFolder(parent: PatternFolder): ListPropsListItem[] {
		const result: ListPropsListItem[] = [];

		parent.getChildren().forEach((child: PatternFolder) => {
			const childItem: ListPropsListItem = { value: child.getName() };
			childItem.children = this.createItemsFromFolder(child);
			result.push(childItem);
		});

		parent.getPatterns().forEach((pattern: Pattern) => {
			result.push({ value: pattern.getName() });
		});

		return result;
	}
}
