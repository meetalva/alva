import Input from '../../lsg/patterns/input/';
import { PatternFolder } from '../../store/pattern/folder';
import { List, ListPropsListItem } from '../presentation/list';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { Pattern } from '../../store/pattern';
import * as React from 'react';
import { Store } from '../../store';

export interface PatternListProps {
	store: Store;
}

@observer
export class PatternList extends React.Component<PatternListProps> {
	public items: ListPropsListItem[] = [];
	public constructor(props: PatternListProps) {
		super(props);

		this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
	}

	public render(): JSX.Element {
		if (this.props.store.getPatternSearchTerm() === '') {
			this.items = this.createItemsFromFolder(
				this.props.store.getPatternRoot() as PatternFolder
			);
		} else {
			this.items = this.props.store.searchPatterns(this.props.store.getPatternSearchTerm()).map(pattern => ({ value: pattern.getName() }));
		}
		return (
			<div>
				<Input handleChange={this.handleSearchInputChange}/>
				<List headline="Patterns" items={this.items} />
			</div>
		);
	}

	public createItemsFromFolder(folder: PatternFolder): ListPropsListItem[] {
		const result: ListPropsListItem[] = [];

		if (folder) {
			folder.getChildren().forEach((child: PatternFolder) => {
				const childItem: ListPropsListItem = { value: child.getName() };
				childItem.children = this.createItemsFromFolder(child);
				result.push(childItem);
			});

			folder.getPatterns().forEach((pattern: Pattern) => {
				result.push({ value: pattern.getName() });
			});
		}

		return result;
	}
	@action
	protected handleSearchInputChange(evt: React.ChangeEvent<HTMLInputElement>): void {
		this.props.store.setPatternSearchTerm(evt.target.value);
	}
}
