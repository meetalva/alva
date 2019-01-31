import { PatternStringProperty } from './string-property';

test('coerces undefined to empty string if required', () => {
	const property = PatternStringProperty.fromDefaults({
		required: true
	});

	const actual = property.coerceValue(undefined);
	expect(actual).toBe('');
});

test('coerces null to empty string if required', () => {
	const property = PatternStringProperty.fromDefaults({
		required: true
	});

	const actual = property.coerceValue(null);
	expect(actual).toBe('');
});

test('coerces undefined to undefined if optional', () => {
	const property = PatternStringProperty.fromDefaults();

	const actual = property.coerceValue(undefined);
	expect(actual).toBeUndefined();
});

test('coerces null to undefined if optional', () => {
	const property = PatternStringProperty.fromDefaults();

	const actual = property.coerceValue(null);
	expect(actual).toBeUndefined();
});

test('coerces number to string represenation', () => {
	const property = PatternStringProperty.fromDefaults();

	const actual = property.coerceValue(1);
	expect(actual).toBe('1');
});

test('coerces NaN to undefined', () => {
	const property = PatternStringProperty.fromDefaults();

	const actual = property.coerceValue(parseInt('thing', 10));
	expect(actual).toBe(undefined);
});

test('coerces boolean to string representation', () => {
	const property = PatternStringProperty.fromDefaults();

	const actual = property.coerceValue(true);
	expect(actual).toBe('true');
});
