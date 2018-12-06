import * as MobxReact from 'mobx-react';
import * as Monaco from 'monaco-editor';
import * as React from 'react';
import * as JSON5 from 'json5';
import * as Model from '../../model';
import { WithStore } from '../../store';
import * as Components from '../../components';
import { PatternUnknownProperty } from '../../model/pattern-property/unknown-property';

export interface PropertyUnknownEditorProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyUnknownEditor extends React.Component<PropertyUnknownEditorProps> {
	private node: HTMLElement | null;
	private editor: Monaco.editor.IStandaloneCodeEditor;
	private dispose: () => void | null;

	public componentDidMount(): void {
		const props = this.props as PropertyUnknownEditorProps & WithStore;
		const patternProperty = this.props.property.getPatternProperty() as PatternUnknownProperty;

		if (!patternProperty) {
			return;
		}

		if (!this.node) {
			return;
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

		this.editor = Monaco.editor.create(this.node, {
			language: 'json',
			value: [comment, value].join(''),
			theme: 'vs-light',
			automaticLayout: true
		});

		this.editor.updateOptions({
			renderWhitespace: 'all',
			lineDecorationsWidth: 0,
			lineNumbers: 'off',
			glyphMargin: false,
			contextmenu: false,
			scrollBeyondLastLine: false,
			folding: false,
			scrollbar: {
				vertical: 'hidden',
				horizontal: 'hidden'
			},
			minimap: {
				enabled: false
			}
		});

		this.node.style.height = `${this.editor.getModel().getLineCount() * 20}px`;
		this.editor.layout();

		this.editor.onDidChangeModelContent(async () => {
			const value = this.editor
				.getValue()
				.split(comment)
				.join('');

			try {
				JSON5.parse(value);
				this.props.property.setValue(value);
			} catch (err) {
				console.error(err);
				// TODO: Show error message at editor
			}

			if (this.node) {
				this.node.style.height = `${this.editor.getModel().getLineCount() * 20}px`;
				this.editor.layout();
			}
		});

		this.editor.onDidBlurEditor(async () => {
			props.store.commit();
		});
	}

	public componentWillUnmount(): void {
		if (typeof this.dispose === 'function') {
			this.dispose();
		}
	}

	public render(): JSX.Element | null {
		const patternProperty = this.props.property.getPatternProperty();

		if (!patternProperty) {
			return null;
		}

		return (
			<>
				<Components.PropertyLabel label={patternProperty.getPropertyName()} />
				<div
					style={{
						border: `1px solid ${Components.Color.Grey90}`,
						borderRadius: 4,
						padding: `${Components.getSpace(Components.SpaceSize.XS)}px`,
						boxSizing: 'border-box',
						marginBottom: `${Components.getSpace(Components.SpaceSize.S)}px`,
						width: '100%',
						background: Components.Color.White
					}}
				>
					<div
						ref={node => (this.node = node)}
						style={{
							width: '100%',
							minHeight: '50px',
							overflow: 'hidden'
						}}
					/>
				</div>
			</>
		);
	}
}
