// tslint:disable:no-bitwise
import * as TestUtils from '../test-utils';
import { isReactEventHandlerType } from './is-react-event-handler-type';

const fixtures = require('fixturez')(__dirname);

test('returns false for any prop declaration', () => {
	const { sourceFile, program } = TestUtils.getFixtureSourceFile('prop-any.ts', { fixtures });
	const [prop] = TestUtils.getPropTypes(sourceFile, { program });
	expect(isReactEventHandlerType(prop, { program })).toBe(false);
});

test('returns true for React.EventHandler prop declaration', () => {
	const { sourceFile, program } = TestUtils.getFixtureSourceFile('prop-event-handler.ts', {
		fixtures
	});
	const [prop] = TestUtils.getPropTypes(sourceFile, { program });
	expect(isReactEventHandlerType(prop, { program })).toBe(true);
});

test('returns true for method declaration with React.Event as first argument', () => {
	const { sourceFile, program } = TestUtils.getFixtureSourceFile('prop-event-method.ts', {
		fixtures
	});
	const [prop] = TestUtils.getPropTypes(sourceFile, { program });
	expect(isReactEventHandlerType(prop, { program })).toBe(true);
});

test('returns true for function member declarations with React.Event as first argument', () => {
	const { sourceFile, program } = TestUtils.getFixtureSourceFile('prop-event-function.ts', {
		fixtures
	});
	const [prop] = TestUtils.getPropTypes(sourceFile, { program });
	expect(isReactEventHandlerType(prop, { program })).toBe(true);
});
