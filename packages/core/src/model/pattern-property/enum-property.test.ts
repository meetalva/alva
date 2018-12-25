import { PatternEnumProperty, PatternEnumPropertyOption } from './enum-property';

test('.update adds options', () => {
	const propA = PatternEnumProperty.fromDefaults({
		contextId: 'a',
		options: []
	});

	const propB = PatternEnumProperty.fromDefaults({
		contextId: 'a',
		options: [
			PatternEnumPropertyOption.fromDefaults({
				contextId: 'a'
			}),
			PatternEnumPropertyOption.fromDefaults({
				contextId: 'b'
			}),
			PatternEnumPropertyOption.fromDefaults({
				contextId: 'c'
			})
		]
	});

	propA.update(propB);
	expect(propA.getOptions()).toEqual([
		expect.objectContaining({ contextId: 'a' }),
		expect.objectContaining({ contextId: 'b' }),
		expect.objectContaining({ contextId: 'c' })
	]);
});

test('.update updates options', () => {
	const before = [
		PatternEnumPropertyOption.fromDefaults({
			id: 'a',
			contextId: 'a',
			value: 'a'
		}),
		PatternEnumPropertyOption.fromDefaults({
			id: 'b',
			contextId: 'b',
			value: 'b'
		}),
		PatternEnumPropertyOption.fromDefaults({
			id: 'c',
			contextId: 'c',
			value: 'c'
		})
	];

	const after = before.map(b => PatternEnumPropertyOption.from(b.toJSON())).map(b => {
		b.setValue((b.getValue() as string).repeat(2));
		return b;
	});

	const propA = PatternEnumProperty.fromDefaults({
		contextId: 'a',
		options: before
	});

	const propB = PatternEnumProperty.fromDefaults({
		contextId: 'a',
		options: after
	});

	propA.update(propB);
	expect(propA.getOptions()).toEqual([
		expect.objectContaining({ contextId: 'a' }),
		expect.objectContaining({ contextId: 'b' }),
		expect.objectContaining({ contextId: 'c' })
	]);
});

test('.update removes options', () => {
	const propA = PatternEnumProperty.fromDefaults({
		contextId: 'a',
		options: [
			PatternEnumPropertyOption.fromDefaults({
				contextId: 'a'
			}),
			PatternEnumPropertyOption.fromDefaults({
				contextId: 'b'
			}),
			PatternEnumPropertyOption.fromDefaults({
				contextId: 'c'
			})
		]
	});

	const propB = PatternEnumProperty.fromDefaults({
		contextId: 'a',
		options: [
			PatternEnumPropertyOption.fromDefaults({
				contextId: 'a'
			}),
			PatternEnumPropertyOption.fromDefaults({
				contextId: 'c'
			})
		]
	});

	expect(propA.getOptionByContextId('b')).not.toBe(undefined);
	propA.update(propB);
	expect(propA.getOptionByContextId('b')).toBe(undefined);
});
