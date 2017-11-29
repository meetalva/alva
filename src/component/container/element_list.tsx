import { ElementValue } from '../../store/page/element_value';
import List from '../presentation/list';
import { ListPropsListItem } from '../presentation/list';
import PageElement from '../../store/page/page_element';
import React from 'react';
import Store from '../../store';


interface ElementListProps {
	store: Store
}

export default class ElementList extends React.Component<ElementListProps> {
	constructor(props: ElementListProps) {
		super(props);
	}

	render() {
		return (
			<List headline="Elements" items={[this.createItemFromElement('Root', this.props.store.currentPage.root)]} />
		);
	}

	createItemFromElement(key: string, element: PageElement): ListPropsListItem {
		const items: ListPropsListItem[] = [];
		const properties: { [name: string]: ElementValue } = element.properties || {};
		Object.keys(properties).forEach((key: string) => {
			items.push(this.createItemFromProperty(key, properties[key]));
		});
		const children: PageElement[] = element.children || [];
		children.forEach((value: PageElement, index: number) => {
			items.push(this.createItemFromProperty(children.length > 1 ? 'Child ' + (index + 1) : 'Child', value));
		});

		return {
			label: key,
			value: element.patternSrc.replace(/^.*\//, ''),
			children: items
		};
	}

	createItemFromProperty(key: string, value: /* TODO: Does not compile: ElementValue */ any): ListPropsListItem {
		if (Array.isArray(value)) {
			const items = [];
			(value/* TODO: Does not compile:  as any[]*/).forEach((child, index: number) => {
				items.push(this.createItemFromProperty(String(index + 1), child));
			});
			return { value: key, children: items };
		}

		if (value === null || typeof value !== 'object') {
			return { label: key, value: String(value) };
		}

		if (value['_type'] === 'pattern') {
			return this.createItemFromElement(key, value/* TODO: Does not compile:  as PageElement*/);
		} else {
			const items: ListPropsListItem[] = [];
			Object.keys(value).forEach((childKey: string) => {
				items.push(this.createItemFromProperty(childKey, value[childKey]));
			});
			return { value: key, children: items };
		}
	}
}
