import * as MobxReact from 'mobx-react';
import * as Model from '@meetalva/model';
import * as React from 'react';
import * as ReactLoadable from 'react-loadable';
import { ViewStore } from '../../store';
import * as Types from '@meetalva/types';
import * as Mobx from 'mobx';

import { PropertyItemAsset } from './property-item-asset';
import { PropertyItemBoolean } from './property-item-boolean';
import { PropertyItemEnum } from './property-item-enum';
import { PropertyItemEvent } from './property-item-event';
import { PropertyItemNumber } from './property-item-number';
import { PropertyItemString } from './property-item-string';
import { PropertyItemButtonGroup } from './property-item-button-group';
import { PropertyItemColor } from './property-item-color';
import { ReferenceSelect, IconPosition } from './reference-select';
import { PropertyUnknownEditorSkeleton } from './property-unknown-editor-skeleton';

export interface PropertyListItemProps {
	property: Model.ElementProperty;
	onDidRender?(): void;
}

export interface StoreInjection {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListItem extends React.Component<PropertyListItemProps> {
	public render(): React.ReactNode | null {
		const props = this.props as PropertyListItemProps & StoreInjection;
		const { property } = props;

		// This is probably our ticket to hell,
		// I haven't found a straightforward way to use
		// outer props in the .loading component though
		const PropertyUnknownEditor = ReactLoadable({
			loader: () => import('./property-unknown-editor').then(m => m.PropertyUnknownEditor),
			loading: () => <PropertyUnknownEditorSkeleton property={props.property} />
		}) as any;

		const patternProperty = property.getPatternProperty();

		if (!patternProperty || patternProperty.getHidden()) {
			return null;
		}

		const id = property.getId();

		switch (patternProperty.getType()) {
			case Types.PatternPropertyType.Asset: {
				return <PropertyItemAsset key={id} property={property} />;
			}
			case Types.PatternPropertyType.Boolean: {
				return (
					<ReferenceSelect key={id} property={property}>
						<PropertyItemBoolean property={property} />
					</ReferenceSelect>
				);
			}
			case Types.PatternPropertyType.Enum: {
				const inputType = patternProperty.getInputType();
				return inputType === Types.PatternPropertyInputType.ButtonGroup ? (
					<PropertyItemButtonGroup key={id} property={property} />
				) : (
					<ReferenceSelect
						key={id}
						property={property}
						iconPosition={IconPosition.Indent}
						onDidRender={props.onDidRender}
					>
						<PropertyItemEnum property={property} />
					</ReferenceSelect>
				);
			}
			case Types.PatternPropertyType.EventHandler: {
				return <PropertyItemEvent key={id} property={property} />;
			}
			case Types.PatternPropertyType.Number:
				return (
					<ReferenceSelect key={id} property={property} iconPosition={IconPosition.Indent}>
						<PropertyItemNumber key={id} property={property} />
					</ReferenceSelect>
				);
			case Types.PatternPropertyType.String:
				const control = patternProperty.getControl();

				return control === 'color' ? (
					<ReferenceSelect key={id} property={property}>
						<PropertyItemColor property={property} />
					</ReferenceSelect>
				) : (
					<ReferenceSelect key={id} property={property}>
						<PropertyItemString property={property} onDidRender={props.onDidRender} />
					</ReferenceSelect>
				);
			case Types.PatternPropertyType.Unknown:
			default: {
				return <PropertyUnknownEditor property={property} />;
			}
		}
	}
}
