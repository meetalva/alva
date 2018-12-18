import * as TestUtils from '../../test-utils';
import { createEnumProperty } from './create-enum-property';

const fixtures = require('fixturez')(__dirname);

test('uses member name as context id', () => {
	const { sourceFile, program } = TestUtils.getFixtureSourceFile('enum.ts', { fixtures });
	const typechecker = program.getTypeChecker();
	const { symbol, type } = TestUtils.getFirstPropType(sourceFile, { program });
	const mockContext = { program, getEnumOptionId: jest.fn(), getPropertyId: jest.fn() };

	const enumProperty = createEnumProperty(
		{
			typechecker,
			symbol,
			type
		},
		mockContext
	);

	expect(enumProperty).toEqual(
		expect.objectContaining({
			options: expect.arrayContaining([
				expect.objectContaining({
					contextId: 'One'
				}),
				expect.objectContaining({
					contextId: 'Two'
				})
			])
		})
	);
});
