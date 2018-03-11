import { BooleanItem } from '../../lsg/patterns/property-items/boolean-item';
import { EnumItem, Values } from '../../lsg/patterns/property-items/enum-item';
import { EnumProperty, Option } from '../../store/styleguide/property/enum-property';
import { observer } from 'mobx-react';
import { ObjectProperty } from '../../store/styleguide/property/object-property';
import { Property } from '../../store/styleguide/property/property';
import * as React from 'react';
import { Store } from '../../store/store';
import { StringItem } from '../../lsg/patterns/property-items/string-item';

export interface PropertyListProps {
	store: Store;
}

@observer
export class PropertyList extends React.Component<PropertyListProps> {
	public constructor(props: PropertyListProps) {
		super(props);
	}

	public convertOptionsToValues(options: Option[]): Values[] {
		return options.map(option => ({
			id: option.getId(),
			name: option.getName()
		}));
	}

	public render(): JSX.Element {
		const selectedElement = this.props.store.getSelectedElement();

		if (!selectedElement) {
			return <div>No Element selected</div>;
		}

		const pattern = selectedElement.getPattern();
		const properties: Property[] | undefined = pattern && pattern.getProperties();
		if (!properties) {
			return <div>This element has no properties</div>;
		}

		return (
			<div>
				{properties.map(property => {
					const id = property.getId();
					const name = property.getName();
					const type = property.getType();
					const value = selectedElement.getPropertyValue(id);

					switch (type) {
						case 'boolean':
							return (
								<BooleanItem
									key={id}
									label={name}
									checked={value as boolean}
									handleChange={event => {
										selectedElement.setPropertyValue(id, !value);
									}}
								/>
							);

						case 'string':
							return (
								<StringItem
									key={id}
									label={name}
									value={value as string}
									handleChange={event => {
										selectedElement.setPropertyValue(id, event.currentTarget.value);
									}}
								/>
							);

						case 'enum':
							const options = (property as EnumProperty).getOptions();
							const option: Option | undefined = (property as EnumProperty).getOptionById(
								value as string
							);

							return (
								<EnumItem
									key={id}
									label={name}
									selectedValue={option && option.getId()}
									values={this.convertOptionsToValues(options)}
									handleChange={event => {
										selectedElement.setPropertyValue(id, event.currentTarget.value);
									}}
								/>
							);

						case 'object':
							const members = (property as ObjectProperty).getProperties();

							return (
								<details>
									<summary>{name}</summary>
									<div>{members.map(member => <div>{member.getName()}</div>)}</div>
								</details>
							);

						default:
							return <div key={id}>Unknown type: {type}</div>;
					}
				})}
			</div>
		);
	}
}
