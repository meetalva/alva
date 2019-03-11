import * as Fs from 'fs';
import { getDefaultCode, getCommentValue, analyzeSlots } from './slot-analzyer';
import * as TypescriptUtils from '../typescript-utils';
import * as TestUtils from '../test-utils';
import { Project } from 'ts-simple-ast';
import { exec } from 'child_process';

const fixtures = require('fixturez')(__dirname);

let ctx: ReturnType<typeof TestUtils.getFixtureSourceFile>;
let project: Project;

beforeAll(() => {
	ctx = TestUtils.getFixtureSourceFile('props-comments.ts', { fixtures });
	project = new Project();
});

test('extracts comment value from declaration', () => {
	const prop = TestUtils.getNamedPropType('plainComment', ctx);
	const declaration = TypescriptUtils.findTypeDeclaration(prop.symbol, {
		typechecker: ctx.program.getTypeChecker()
	});

	expect(getCommentValue(declaration!)).toBe('Some basic comment');
});

test('extracts comment value with inline @ in backticks', () => {
	const prop = TestUtils.getNamedPropType('atSign', ctx);
	const declaration = TypescriptUtils.findTypeDeclaration(prop.symbol, {
		typechecker: ctx.program.getTypeChecker()
	});

	expect(getCommentValue(declaration!)).toBe(
		['', '@default', '```', "import { Text } from '@meetalva/essentials';", '```'].join('\n')
	);
});

test('extracts comment value with inline @ in tilde', () => {
	const prop = TestUtils.getNamedPropType('atSignTilde', ctx);
	const declaration = TypescriptUtils.findTypeDeclaration(prop.symbol, {
		typechecker: ctx.program.getTypeChecker()
	});

	expect(getCommentValue(declaration!)).toBe(
		['', '@default', '~~~', "import { Text } from '@meetalva/essentials';", '~~~'].join('\n')
	);
});

test('gets default code from ~~~ fenced code block', () => {
	const input = Fs.readFileSync(fixtures.find('slot-analyzer-fenced-tilde.md')).toString();
	expect(getDefaultCode(input)).toBe('export default () => <div>Hello, World</div>');
});

test('gets default code from ``` fenced code block', () => {
	const input = Fs.readFileSync(fixtures.find('slot-analyzer-fenced-tick.md')).toString();
	expect(getDefaultCode(input)).toBe('export default () => <div>Hello, World</div>');
});

test('gets default code from whitespace fenced code block', () => {
	const input = Fs.readFileSync(fixtures.find('slot-analyzer-fenced-whitespace.md')).toString();
	expect(getDefaultCode(input)).toBe('export default () => <div>Hello, World</div>');
});

test('uses last code block', () => {
	const input = Fs.readFileSync(fixtures.find('slot-analyzer-last.md')).toString();
	expect(getDefaultCode(input)).toBe('Last');
});

test('ignores blocks under other tags', () => {
	const input = Fs.readFileSync(fixtures.find('slot-analyzer-other-tags.md')).toString();
	expect(getDefaultCode(input)).toBeUndefined();
});

test('creates defaults for valid blocks', () => {
	const file = TestUtils.getFixtureSourceFile('props-comments.ts', { fixtures });
	const propTypes = TestUtils.getPropInterface(file.sourceFile, { program: file.program });

	const slots = analyzeSlots(propTypes.type, {
		program: file.program,
		project,
		pkg: { name: 'name' },
		getSlotId: id => id
	});

	expect(slots).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				contextId: 'atSign'
			}),
			expect.objectContaining({
				contextId: 'atSignTilde'
			})
		])
	);
});
