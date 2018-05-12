import * as Sender from '../../message/client';
import * as Components from '../../components';
import { ServerMessageType } from '../../message';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import * as PropertyItems from '../../components/property-items';
import * as React from 'react';
import { Element, Option, PropertyValueCommand, ViewStore } from '../../store';
import * as uuid from 'uuid';

export interface PropertyTreeProps {
	element: Element;
}

@observer
export class PropertyTree extends React.Component<PropertyTreeProps> {
	@MobX.observable protected isOpen = false;
	protected lastCommand: PropertyValueCommand;

	protected handleBlur(): void {
		if (this.lastCommand) {
			this.lastCommand.seal();
		}
	}

	// tslint:disable-next-line:no-any
	/* protected handleChange(id: string, value: any, context?: ObjectContext): void {
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
	} */

	/* public render(): React.ReactNode {
		return (
			<Components.Element
				dragging={false}
				title={property.getLabel()}
				open={this.isOpen}
			>
				{this.isOpen ? this.renderItems() : 'hidden'}
			</Components.Element>
		);
	} */

	/* protected renderItems(): React.ReactNode {
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
					const label = property.getLabel();

					return null;

					/* const value = element.getPropertyValue();

					/*
					 	protected getValue(id: string, path?: string): Types.PropertyValue {
		const fullPath = path ? `${path}.${id}` : id;
		const [rootId, ...propertyPath] = fullPath.split('.');
		return this.props.element.getPropertyValue(rootId, propertyPath.join('.'));
	}

					switch (property.type) {
						case 'boolean':
							return (
								<PropertyItems.BooleanItem
									key={id}
									label={label}
									checked={value as boolean}
									onChange={event => this.handleChange(id, !value, context)}
								/>
							);

						case 'string':
							return (
								<PropertyItems.StringItem
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
								<PropertyItems.EnumItem
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
								<PropertyItems.AssetItem
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
	}*/
}
