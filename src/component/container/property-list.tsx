import { AssetItem } from '../../lsg/patterns/property-items/asset-item';
// import { AssetProperty } from '../../store/styleguide/property/asset-property';
import { BooleanItem } from '../../lsg/patterns/property-items/boolean-item';
import * as Sender from '../../message/client';
import Element from '../../lsg/patterns/element';
import { EnumItem, Values } from '../../lsg/patterns/property-items/enum-item';
import { EnumProperty, Option } from '../../store/styleguide/property/enum-property';
import { ServerMessageType } from '../../message';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { ObjectProperty } from '../../store/styleguide/property/object-property';
import { PageElement } from '../../store/page/page-element';
import * as React from 'react';
import { PropertyValueCommand, ViewStore } from '../../store';
import { StringItem } from '../../lsg/patterns/property-items/string-item';
import * as Types from '../../store/types';
import * as uuid from 'uuid';

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

	protected convertOptionsToValues(options: Option[]): Values[] {
		return options.map(option => ({
			id: option.getId(),
			name: option.getName()
		}));
	}

	protected getValue(id: string, path?: string): Types.PropertyValue {
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
		ViewStore.getInstance().execute(this.lastCommand);
	}

	protected handleChooseAsset(id: string, context?: ObjectContext): void {
		const tid = uuid.v4();

		Sender.receive(message => {
			if (message.id !== tid) {
				return;
			}

			this.handleChange(id, message.payload, context);
		});

		Sender.send({
			type: ServerMessageType.AssetReadRequest,
			id: tid,
			payload: undefined
		});
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
					const value = this.getValue(id, context && context.path);

					switch (property.type) {
						case 'boolean':
							return (
								<BooleanItem
									key={id}
									label={name}
									checked={value as boolean}
									onChange={event => this.handleChange(id, !value, context)}
								/>
							);

						case 'string':
							return (
								<StringItem
									key={id}
									label={name}
									value={value as string}
									onChange={event =>
										this.handleChange(id, event.currentTarget.value, context)
									}
									onBlur={event => this.handleBlur()}
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
									onChange={event =>
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
									onInputChange={event =>
										this.handleChange(id, event.currentTarget.value, context)
									}
									onChooseClick={event => this.handleChooseAsset(id, context)}
									onClearClick={event => this.handleChange(id, undefined, context)}
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
							return <div key={id}>Unknown type: {property.type}</div>;
					}
				})}
			</>
		);
	}
}

@observer
export class PropertyList extends React.Component {
	public render(): React.ReactNode {
		const selectedElement = ViewStore.getInstance().getSelectedElement();

		if (!selectedElement) {
			return <div>No Element selected</div>;
		}

		return <PropertyTree element={selectedElement} />;
	}
}
