import List from '../presentation/list';
import { ListPropsListItem } from '../presentation/list';
import { observer } from 'mobx-react';
import React from 'react';
import Store from '../../store';
import Pattern from '../../store/pattern';
import PatternFolder from '../../store/pattern/pattern_folder';


interface PatternListProps {
	store: Store
}

@observer
export default class PatternList extends React.Component<PatternListProps> {
	constructor(props: PatternListProps) {
		super(props);
	}

	render() {
		const items: ListPropsListItem[] = this.createItemsFromFolder(this.props.store.patterns);
		return (
			<List headline="Patterns" items={items} />
		);
	}

	createItemsFromFolder(parent: PatternFolder): ListPropsListItem[] {
		const result: ListPropsListItem[] = [];

		parent.children.forEach((child: PatternFolder) => {
			const childItem: ListPropsListItem = { value: child.name };
			childItem.children = this.createItemsFromFolder(child);
			result.push(childItem);
		});

		parent.patterns.forEach((pattern: Pattern) => {
			result.push({ value: pattern.name });
		});

		return result;
	}
}
