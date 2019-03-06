import * as Components from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '@meetalva/model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface PropertyItemStringProps {
	property: Model.ElementProperty;
	onDidRender?(): void;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemString extends React.Component<PropertyItemStringProps> {
	public render(): JSX.Element | null {
		const props = this.props as PropertyItemStringProps & { store: ViewStore };
		const { property } = props;

		const patternProperty = property.getPatternProperty();

		if (!patternProperty) {
			return null;
		}

		const example = patternProperty.getExample();

		const valuePre = property.getValue() as string;
		const value = valuePre && valuePre.includes('px') && Number(valuePre.replace('px', ''));
		const unit = patternProperty.getUnit().split('|')[0];
		console.log(unit);

		return (
			<>
				{unit.length === 0 ? (
					<Components.PropertyItemString
						description={patternProperty.getDescription()}
						label={patternProperty.getLabel() as string}
						value={property.getValue() as string}
						onBlur={() => props.store.commit()}
						onChange={e => {
							property.setValue(e.target.value);
						}}
						onResize={() => {
							return this.props.onDidRender && this.props.onDidRender();
						}}
						placeholder={example ? `e.g.: ${example}` : ''}
					/>
				) : (
					<Components.PropertyItemNumber
						description={patternProperty.getDescription()}
						label={patternProperty.getLabel() as string}
						value={value}
						onBlur={() => props.store.commit()}
						onChange={e => {
							property.setValue(`${e.target.value}${unit}`);
						}}
						unit={unit}
						placeholder={example ? `e.g.: ${example}` : ''}
					/>
				)}
			</>
		);
	}
}
