import * as Button from '../button';
import { Color } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

const StyledButtonGroup = styled.div`
	display: flex;
	width: 100%;
	margin-top: ${getSpace(SpaceSize.XS)}px;
	border-top: 1px solid ${Color.Grey90};

	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-top-width: 0.5px;
	}

	*:nth-child(2n) {
		border-left-width: 1px;

		@media screen and (-webkit-min-device-pixel-ratio: 2) {
			border-left-width: 0.5px;
		}
	}

	[disabled] {
		opacity: 0.3;
	}
`;

export const ButtonGroupButton = props => (
	<Button.Button
		{...props}
		order={Button.ButtonOrder.Tertiary}
		size={Button.ButtonSize.Medium}
		buttonRole={Button.ButtonRole.Inline}
	>
		{props.children}
	</Button.Button>
);

export class ButtonGroup extends React.Component {
	public static ButtonLeft = props => React.Children.only(props.children);
	public static ButtonRight = props => React.Children.only(props.children);
	public static Placeholder = props => <div />;

	public render(): JSX.Element {
		const { props } = this;

		const children = React.Children.toArray(props.children)
			// tslint:disable-next-line:no-any
			.filter((child): child is React.ReactElement<any> => typeof child !== 'string');

		const left = children.find(c => c.type === ButtonGroup.ButtonLeft) || ButtonGroup.Placeholder;
		const right =
			children.find(c => c.type === ButtonGroup.ButtonRight) || ButtonGroup.Placeholder;

		return (
			<StyledButtonGroup {...props}>
				{left}
				{right}
			</StyledButtonGroup>
		);
	}
}
