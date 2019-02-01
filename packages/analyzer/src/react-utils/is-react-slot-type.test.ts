import * as TestUtils from '../test-utils';
import { isReactSlotType } from './is-react-slot-type';

const fixtures = require('fixturez')(__dirname);

let ctx: ReturnType<typeof TestUtils.getFixtureSourceFile>;

beforeAll(() => {
	ctx = TestUtils.getFixtureSourceFile('prop-slots.tsx', { fixtures });
});

test('returns true for React.ReactNode', () => {
	const prop = TestUtils.getNamedPropType('reactNode', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for React.ReactNodeArray', () => {
	const prop = TestUtils.getNamedPropType('explicitReactNodeArray', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for React.ReactChild', () => {
	const prop = TestUtils.getNamedPropType('reactChild', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for React.ReactElement', () => {
	const prop = TestUtils.getNamedPropType('reactElement', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for JSX.Element', () => {
	const prop = TestUtils.getNamedPropType('jsxElement', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for union type with slot members', () => {
	const prop = TestUtils.getNamedPropType('union', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for union type with only disjunct members', () => {
	const prop = TestUtils.getNamedPropType('disjunct', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(false);
});

test('returns true for React.ReactNode[]', () => {
	const prop = TestUtils.getNamedPropType('reactNodeArray', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for React.ReactChild[]', () => {
	const prop = TestUtils.getNamedPropType('reactChildArray', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for React.ReactElement[]', () => {
	const prop = TestUtils.getNamedPropType('reactElementArray', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for JSX.Element[]', () => {
	const prop = TestUtils.getNamedPropType('jsxElementArray', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for Union[]', () => {
	const prop = TestUtils.getNamedPropType('unionArray', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(true);
});

test('returns true for Disjunct[]', () => {
	const prop = TestUtils.getNamedPropType('disjunctArray', ctx);
	expect(isReactSlotType(prop.type, ctx)).toBe(false);
});
