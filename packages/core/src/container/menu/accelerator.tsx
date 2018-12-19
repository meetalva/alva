import * as React from 'react';

const collisions = {
	'Command+N': () => 'Option+Command+N',
	'Command+O': () => 'Option+Command+O',
	'Shift+Command+N': () => 'Option+Shift+Command+N',
	'Option+Command+Left': () => 'Option+Shift+Command+Left',
	'Option+Command+Right': () => 'Option+Shift+Command+Right'
};

const accelerators: Map<string, (e: KeyboardEvent) => void> = new Map();
const keys = ['Control', 'Option', 'Shift', 'Command'];

if (typeof window !== 'undefined') {
	window.addEventListener('keydown', e => {
		const accelerator = acceleratorFromEvent(e);
		const action = accelerators.get(accelerator);
		if (action) {
			action(e);
		}
	});
}

export interface AcceleratorIndicatorProps {
	accelerator: string;
	onAccelerator(e: KeyboardEvent): void;
}

export class AcceleratorIndicator extends React.Component<AcceleratorIndicatorProps> {
	public componentDidMount() {
		const key = simplifyAccelerator(this.props.accelerator);
		accelerators.set(key, this.props.onAccelerator);
	}

	public componentWillUnmount() {
		const key = simplifyAccelerator(this.props.accelerator);
		accelerators.delete(key);
	}

	public render(): JSX.Element | null {
		const signs = parseAccelerator(this.props.accelerator);
		return <div>{signs}</div>;
	}
}

function simplifyAccelerator(accelerator: string): string {
	const acc = accelerator
		.split('+')
		.map(item => simplify(item))
		.sort((a, b) => {
			const ai = keys.indexOf(a);
			const bi = keys.indexOf(b);

			if (ai === -1) {
				return 1;
			}

			if (bi === -1) {
				return -1;
			}

			return ai - bi;
		})
		.join('+');

	return (collisions as any)[acc] ? (collisions as any)[acc]() : acc;
}

function parseAccelerator(accelerator: string): string {
	return simplifyAccelerator(accelerator)
		.split('+')
		.map(item => toUnicode(item))
		.join('');
}

function acceleratorFromEvent(e: KeyboardEvent): string {
	return simplifyAccelerator(
		[
			e.shiftKey ? 'Shift' : '',
			e.metaKey ? 'Command' : '',
			e.altKey ? 'Option' : '',
			e.ctrlKey ? 'Control' : '',
			normalizeKey(e.code, e.key)
		]
			.filter(Boolean)
			.join('+')
	);
}

function normalizeKey(code: KeyboardEvent['code'], key: KeyboardEvent['key']): string {
	if (key.match(/^[a-z]$/)) {
		return key.toUpperCase();
	}

	if (code.match(/^Key[A-Z]$/)) {
		return code.charAt(code.length - 1);
	}

	if (code.match(/^Digit[0-9]$/)) {
		return code.charAt(code.length - 1);
	}

	if (code.match(/^Arrow([a-zA-Z]*)$/)) {
		return code.replace('Arrow', '');
	}

	if (code === 'Backspace') {
		return 'Delete';
	}

	return '';
}

function simplify(item: string): string {
	switch (item) {
		case 'Cmd':
		case 'Command':
		case 'CommandOrCtrl':
		case 'CmdOrCtrl':
			return 'Command';
		case 'Ctrl':
		case 'Control':
			return 'Control';
		case 'Alt':
		case 'Option':
			return 'Option';
		case 'Delete':
		case 'Backspace':
			return 'Backspace';
		default:
			return item;
	}
}

function toUnicode(item: string): string {
	switch (item) {
		case 'Command':
			return '⌘';
		case 'Control':
			return '⌃';
		case 'Shift':
			return '⇧';
		case 'Option':
			return '⌥';
		case 'Left':
			return '←';
		case 'Right':
			return '→';
		case 'Backspace':
			return '⌫';
		default:
			return item;
	}
}
