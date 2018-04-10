import { AssetItem } from '../../lsg/patterns/property-items/asset-item';
import { AssetProperty } from '../../store/styleguide/property/asset-property';
import { BooleanItem } from '../../lsg/patterns/property-items/boolean-item';
import { remote } from 'electron';
import Element from '../../lsg/patterns/element';
import { EnumItem, Values } from '../../lsg/patterns/property-items/enum-item';
import { EnumProperty, Option } from '../../store/styleguide/property/enum-property';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { ObjectProperty } from '../../store/styleguide/property/object-property';
import { PageElement } from '../../store/page/page-element';
import { PropertyValue } from '../../store/page/property-value';
import { PropertyValueCommand } from '../../store/command/property-value-command';
import * as React from 'react';
import { Store } from '../../store/store';
import { StringItem } from '../../lsg/patterns/property-items/string-item';

interface ObjectContext {
	path: string;
	property: ObjectProperty;
}

interface PropertyTreeProps {
	context?: ObjectContext;
	element: PageElement;
}

@observer
class PropertyTree extends React.Component<PropertyTreeProps> {
	@MobX.observable protected isOpen = false;
	protected lastCommand: PropertyValueCommand;

	public constructor(props: PropertyTreeProps) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	protected convertOptionsToValues(options: Option[]): Values[] {
		return options.map(option => ({
			id: option.getId(),
			name: option.getName()
		}));
	}

	protected getValue(id: string, path?: string): PropertyValue {
		const fullPath = path ? `${path}.${id}` : id;
		const [rootId, ...propertyPath] = fullPath.split('.');
		return this.props.element.getPropertyValue(rootId, propertyPath.join('.'));
	}

	protected handleBlur(): void {
		if (this.lastCommand) {
			this.lastCommand.seal();
		}
	}

	// tslint:disable-next-line:no-any
	protected handleChange(id: string, value: any, context?: ObjectContext): void {
		const fullPath: string = context ? `${context.path}.${id}` : id;
		const [rootId, ...propertyPath] = fullPath.split('.');
		this.lastCommand = new PropertyValueCommand(
			this.props.element,
			rootId,
			value,
			propertyPath.join('.')
		);
		Store.getInstance().execute(this.lastCommand);
	}

	protected handleChooseAsset(id: string, context?: ObjectContext): void {
		remote.dialog.showOpenDialog(
			{
				title: 'Select an image',
				properties: ['openFile']
			},
			filePaths => {
				if (filePaths && filePaths.length) {
					const dataUrl = AssetProperty.getValueFromFile(filePaths[0]);
					this.handleChange(id, dataUrl, context);
				}
			}
		);
	}

	protected handleClick(): void {
		this.isOpen = !this.isOpen;
	}

	public render(): React.ReactNode {
		const { context } = this.props;

		if (!context) {
			return this.renderItems();
		}

		const { property } = context;

		return (
			<Element
				dragging={false}
				title={property.getName()}
				open={this.isOpen}
				onClick={this.handleClick}
			>
				{this.isOpen ? this.renderItems() : 'hidden'}
			</Element>
		);
	}

	protected renderItems(): React.ReactNode {
		const { context, element } = this.props;
		const pattern = element.getPattern();

		const properties = context
			? context.property.getProperties()
			: pattern && pattern.getProperties();

		if (!properties) {
			return <div>This element has no properties</div>;
		}

		return (
			<>
				{properties.map(property => {
					const id = property.getId();
					const name = property.getName();
					const type = property.getType();
					const value = this.getValue(id, context && context.path);

					switch (type) {
						case 'boolean':
							return (
								<BooleanItem
									key={id}
									label={name}
									checked={value as boolean}
									handleChange={event => this.handleChange(id, !value, context)}
								/>
							);

						case 'string':
							return (
								<StringItem
									key={id}
									label={name}
									value={value as string}
									handleChange={event =>
										this.handleChange(id, event.currentTarget.value, context)
									}
									handleBlur={event => this.handleBlur()}
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
									handleChange={event =>
										this.handleChange(id, event.currentTarget.value, context)
									}
								/>
							);

						case 'asset':
							const src = value as string | undefined;
							return (
								<AssetItem
									key={id}
									label={name}
									inputValue={src && !src.startsWith('data:') ? src : ''}
									imageSrc={src}
									handleInputChange={event =>
										this.handleChange(id, event.currentTarget.value, context)
									}
									handleChooseClick={event => this.handleChooseAsset(id, context)}
									handleClearClick={event => this.handleChange(id, undefined, context)}
								/>
							);

						case 'object':
							const objectProperty = property as ObjectProperty;
							const newPath = (context && `${context.path}.${id}`) || id;

							const newContext: ObjectContext = {
								path: newPath,
								property: objectProperty
							};

							return <PropertyTree key={id} context={newContext} element={element} />;

						default:
							return <div key={id}>Unknown type: {type}</div>;
					}
				})}
			</>
		);
	}
}

@observer
export class PropertyList extends React.Component {
	public render(): React.ReactNode {
		const selectedElement = Store.getInstance().getSelectedElement();

		if (!selectedElement) {
			return <div>No Element selected</div>;
		}

		return <PropertyTree element={selectedElement} />;
	}
}
