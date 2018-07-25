import * as Components from '../components';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as Monaco from 'monaco-editor';
import * as React from 'react';
import { WithStore } from '../store';

@MobxReact.inject('store')
@MobxReact.observer
export class PaneDevelopmentEditor extends React.Component {
	private node: HTMLElement | null;
	private editor: Monaco.editor.IStandaloneCodeEditor;
	private dispose: () => void | null;

	public componentDidMount(): void {
		const props = this.props as WithStore;

		if (!this.node) {
			return;
		}

		const storeEnhancer = props.store
			.getProject()
			.getUserStore()
			.getEnhancer();

		Monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
			noSemanticValidation: true,
			noSyntaxValidation: false
		});

		Monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: Monaco.languages.typescript.ScriptTarget.ESNext,
			allowNonTsExtensions: true
		});

		this.editor = Monaco.editor.create(this.node, {
			language: 'typescript',
			value: storeEnhancer.getCode(),
			theme: 'vs-light',
			automaticLayout: true
		});

		this.editor.updateOptions({
			minimap: {
				enabled: false
			}
		});

		this.editor.onDidChangeModelContent(() => {
			storeEnhancer.setCode(this.editor.getValue());
		});

		this.editor.onDidBlurEditor(() => {
			storeEnhancer.setCode(this.editor.getValue());
			props.store.commit();
		});

		let lib: Monaco.IDisposable;

		Mobx.autorun(
			() => {
				if (lib) {
					lib.dispose();
				}

				lib = Monaco.languages.typescript.typescriptDefaults.addExtraLib(
					storeEnhancer.getApi()
				);
			},
			{
				scheduler: fn => setTimeout(fn, 1000)
			}
		);
	}

	public componentWillUnmount(): void {
		if (typeof this.dispose === 'function') {
			this.dispose();
		}
	}

	public render(): JSX.Element {
		return (
			<div
				style={{
					height: '100%',
					width: '100%',
					borderTop: `1px solid ${Components.Color.Grey90}`
				}}
				ref={node => (this.node = node)}
			/>
		);
	}
}
