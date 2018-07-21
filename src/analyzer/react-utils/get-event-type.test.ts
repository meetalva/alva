import * as TestUtils from '../test-utils';
import { getEventType } from './get-event-type';

const fixtures = require('fixturez')(__dirname);

test('returns "Event" for any prop', () => {
	const { sourceFile, program } = TestUtils.getFixtureSourceFile('prop-any.ts', { fixtures });
	const typechecker = program.getTypeChecker();
	const prop = TestUtils.getFirstPropType(sourceFile, { program });

	expect(getEventType(prop, { typechecker })).toBe('Event');
});

test('returns "ChangeEvent" for ChangeEventHandler with any type argument', () => {
	const { sourceFile, program } = TestUtils.getFixtureSourceFile('prop-event-handler.ts', {
		fixtures
	});
	const typechecker = program.getTypeChecker();
	const prop = TestUtils.getFirstPropType(sourceFile, { program });

	expect(getEventType(prop, { typechecker })).toBe('ChangeEvent');
});

test('returns "MouseEvent" for method declaration with MouseEvent argument', () => {
	const { sourceFile, program } = TestUtils.getFixtureSourceFile('prop-event-method.ts', {
		fixtures
	});
	const typechecker = program.getTypeChecker();
	const prop = TestUtils.getFirstPropType(sourceFile, { program });

	expect(getEventType(prop, { typechecker })).toBe('MouseEvent');
});

test('returns "MouseEvent" for function member declarations with MouseEvent argument', () => {
	const { sourceFile, program } = TestUtils.getFixtureSourceFile('prop-event-function.ts', {
		fixtures
	});
	const typechecker = program.getTypeChecker();
	const prop = TestUtils.getFirstPropType(sourceFile, { program });

	expect(getEventType(prop, { typechecker })).toBe('MouseEvent');
});
