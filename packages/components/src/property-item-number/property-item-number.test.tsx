import * as React from 'react';
import * as RTL from 'react-testing-library';
import { PropertyItemNumber } from './property-item-number';

// tslint:disable-next-line:no-submodule-imports
import 'jest-dom/extend-expect';

// tslint:disable-next-line:no-submodule-imports
import 'react-testing-library/cleanup-after-each';

const NOOP = () => {}; // tslint:disable-line no-empty

test('renders falsy numbers as string representation', () => {
	const rendered = RTL.render(<PropertyItemNumber label="" value={0} onChange={NOOP} />);
	expect(rendered.baseElement.querySelector('input')).toHaveAttribute('value', '0');
});

test('renders NaN as empty value', () => {
	const rendered = RTL.render(
		<PropertyItemNumber label="" value={parseInt('thing', 10)} onChange={NOOP} />
	);
	expect(rendered.baseElement.querySelector('input')).toHaveAttribute('value', '');
});

test('renders undefined as empty value', () => {
	const rendered = RTL.render(<PropertyItemNumber label="" value={undefined} onChange={NOOP} />);
	expect(rendered.baseElement.querySelector('input')).toHaveAttribute('value', '');
});
