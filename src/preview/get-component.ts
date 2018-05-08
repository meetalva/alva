import { camelCase, upperFirst } from 'lodash';
import { patternIdToWebpackName } from './pattern-id-to-webpack-name';

export interface PassedComponentProps {
	// tslint:disable-next-line:no-any
	[propName: string]: any;
}

export interface InputComponentProps extends PassedComponentProps {
	name: string;
	pattern: string;
}

export interface SyntheticComponents<T> {
	asset: T;
	page: T;
	text: T;
}

export type ComponentGetter<T> = (
	props: InputComponentProps,
	synthetics: SyntheticComponents<T>
) => T | null;

export function getComponent<T>(
	props: InputComponentProps,
	synthetics: SyntheticComponents<T>
): T | undefined {
	const fragments = props.pattern ? props.pattern.split(':') : [];

	if (fragments[0] === 'synthetic') {
		const syntheticType = fragments[1];
		return synthetics[syntheticType];
	}

	// tslint:disable-next-line:no-any
	const win: any = window;

	const component = props.pattern ? win.components[patternIdToWebpackName(props.pattern)] : null;

	if (!component) {
		return;
	}

	const Component = resolveExport<T>(component, props.exportName);

	if (!Component) {
		return;
	}

	// tslint:disable-next-line:no-any
	(Component as any).displayName = upperFirst(camelCase(props.name));

	return Component;
}

// tslint:disable-next-line:no-any
function resolveExport<T>(candidate: any, exportName: string): T | undefined {
	if (exportName === 'default') {
		const Component = typeof candidate.default === 'function' ? candidate.default : candidate;
		return Component;
	}

	return candidate[exportName];
}
