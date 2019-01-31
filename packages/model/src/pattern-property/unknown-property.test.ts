import { PatternUnknownProperty } from './unknown-property';

test('coerces undefined to empty string if required', () => {
	const property = PatternUnknownProperty.fromDefaults({
		required: true
	});

	const actual = property.coerceValue(undefined);
	expect(actual).toBe('');
});

test('coerces null to empty string if required', () => {
	const property = PatternUnknownProperty.fromDefaults({
		required: true
	});

	const actual = property.coerceValue(null);
	expect(actual).toBe('');
});

test('coerces undefined to undefined if optional', () => {
	const property = PatternUnknownProperty.fromDefaults();

	const actual = property.coerceValue(undefined);
	expect(actual).toBeUndefined();
});

test('coerces null to undefined if optional', () => {
	const property = PatternUnknownProperty.fromDefaults();

	const actual = property.coerceValue(null);
	expect(actual).toBeUndefined();
});

test('coerces number to undefined', () => {
	const property = PatternUnknownProperty.fromDefaults();

	const actual = property.coerceValue(1);
	expect(actual).toBeUndefined();
});

test('coerces NaN to undefined', () => {
	const property = PatternUnknownProperty.fromDefaults();

	const actual = property.coerceValue(parseInt('thing', 10));
	expect(actual).toBeUndefined();
});

test('coerces boolean to undefined', () => {
	const property = PatternUnknownProperty.fromDefaults();

	const actual = property.coerceValue(true);
	expect(actual).toBe(undefined);
});
