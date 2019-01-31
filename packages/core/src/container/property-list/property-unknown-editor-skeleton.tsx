import * as MobxReact from 'mobx-react';
import * as React from 'react';
import * as Model from '@meetalva/model';
import * as Components from '@meetalva/components';
import { PatternUnknownProperty } from '@meetalva/model';

export interface PropertyUnknownEditorSkeletonProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyUnknownEditorSkeleton extends React.Component<
	PropertyUnknownEditorSkeletonProps
> {
	public render(): JSX.Element | null {
		const patternProperty = this.props.property.getPatternProperty() as PatternUnknownProperty;

		if (!patternProperty) {
			return null;
		}

		const raw = this.props.property.getRawValue() as string | undefined;
		const value = typeof raw === 'string' ? raw : '';

		const comment = [
			'/**',
			...patternProperty.typeText.split('\n').map(l => ` * ${l}`),
			' **/',
			'',
			''
		].join('\n');

		const commented = [comment, value].join('');
		const lines = commented.split('\n').filter(Boolean);

		return (
			<>
				<Components.PropertyLabel label={patternProperty.getPropertyName()} />
				<pre
					title="Editor is loading ..."
					style={{
						width: '100%',
						height: `${(lines.length + 1) * 20}px`,
						minHeight: '50px',
						border: `1px solid ${Components.Color.Grey90}`,
						boxSizing: 'border-box',
						padding: `${Components.getSpace(Components.SpaceSize.XS)}px`,
						borderRadius: 4,
						overflow: 'hidden',
						marginTop: 0,
						marginBottom: `${Components.getSpace(Components.SpaceSize.S)}px`,
						background: 'white',
						lineHeight: '18px',
						fontFamily: 'Menlo, Monaco, "Courier New", monospace',
						letterSpacing: '0px',
						cursor: 'wait'
					}}
				>
					<span style={{ color: '#008000', opacity: 0.5 }}>{comment}</span>
					<span style={{ opacity: 0.5 }}>{value}</span>
				</pre>
			</>
		);
	}
}
