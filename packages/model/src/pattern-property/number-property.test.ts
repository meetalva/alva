import * as T from '@meetalva/types';
import { PatternNumberProperty } from './number-property';

test('.coerveValue should retain valid number types', () => {
	const prop = new PatternNumberProperty({
		contextId: '',
		inputType: T.PatternPropertyInputType.Default,
		label: '',
		propertyName: ''
	});

	expect(prop.coerceValue(1337)).toBe(1337);
});

test('.coerveValue should parse ints', () => {
	const prop = new PatternNumberProperty({
		contextId: '',
		inputType: T.PatternPropertyInputType.Default,
		label: '',
		propertyName: ''
	});

	expect(prop.coerceValue('1337')).toBe(1337);
});

test('.coerveValue should parse floats', () => {
	const prop = new PatternNumberProperty({
		contextId: '',
		inputType: T.PatternPropertyInputType.Default,
		label: '',
		propertyName: ''
	});

	expect(prop.coerceValue('133.7')).toBe(133.7);
});

test('.coerveValue return undefined for optional props', () => {
	const prop = new PatternNumberProperty({
		contextId: '',
		inputType: T.PatternPropertyInputType.Default,
		label: '',
		propertyName: ''
	});

	expect(prop.coerceValue(undefined)).toBeUndefined();
});

test('.coerveValue fall back to 0 for required props', () => {
	const prop = new PatternNumberProperty({
		contextId: '',
		inputType: T.PatternPropertyInputType.Default,
		label: '',
		propertyName: '',
		required: true
	});

	expect(prop.coerceValue(undefined)).toBe(0);
});
