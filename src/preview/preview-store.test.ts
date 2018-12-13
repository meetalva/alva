import * as Test from './test';

test('execute single element in string', () => {
	const { element, project } = Test.createElementWithProject();
	const { action } = Test.createAction({ element, project });
	action.execute = jest.fn();

	const onClickPatternProp = element.getPattern()!.getPropertyByContextId('onClick')!;
	element.setPropertyValue(onClickPatternProp.getId(), action.getId());

	const props = Test.getRenderProperties({ element, project });
	props.onClick();

	expect(action.execute).toHaveBeenCalled();
});

test('execute single element action in array', () => {
	const { element, project } = Test.createElementWithProject();
	const { action } = Test.createAction({ element, project });
	action.execute = jest.fn();

	const onClickPatternProp = element.getPattern()!.getPropertyByContextId('onClick')!;
	element.setPropertyValue(onClickPatternProp.getId(), [action.getId()]);

	const props = Test.getRenderProperties({ element, project });
	props.onClick();

	expect(action.execute).toHaveBeenCalled();
});

test('executes multiple element actions in array', () => {
	const { element, project } = Test.createElementWithProject();
	const { action: actionA } = Test.createAction({ element, project });
	const { action: actionB } = Test.createAction({ element, project });

	actionA.execute = jest.fn();
	actionB.execute = jest.fn();

	const onClickPatternProp = element.getPattern()!.getPropertyByContextId('onClick')!;
	element.setPropertyValue(onClickPatternProp.getId(), [actionA.getId(), actionB.getId()]);

	const props = Test.getRenderProperties({ element, project });
	props.onClick();

	expect(actionA.execute).toHaveBeenCalled();
	expect(actionB.execute).toHaveBeenCalled();
});
