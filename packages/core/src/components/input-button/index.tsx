import * as React from 'react';
import styled from 'styled-components';
import { Button, ButtonSize } from '../button';
import { PropertyInputStyles } from '../property-input';

const StyledWrapper = styled.div`
	position: relative;
	width: 100%;
	display: flex;
`;

const StyledInput = styled.input`
	${PropertyInputStyles};
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
`;

const StyledButton = styled(Button)`
	flex-shrink: 0;
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
`;

export interface InputButtonProps {
	className?: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
	value?: string;
}

export const InputButton: React.SFC<InputButtonProps> = props => (
	<StyledWrapper>
		<StyledInput
			onChange={props.onChange}
			onBlur={props.onBlur}
			type="text"
			value={props.value || ''}
			placeholder={props.placeholder}
		/>
		<StyledButton size={ButtonSize.Medium}>{props.children}</StyledButton>
	</StyledWrapper>
);
