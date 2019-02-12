import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { Copy } from '../copy';

/**
 * @name Radio
 */

export interface RadioProps {
	/** @name Label Text @default Lorem Ipsum */ labelText?: string;
	/** @name Group Name @default radio1 */ groupName?: string;
	/** @name Value @default value */ value?: string;
	/** @name Checked @default false */ checked?: boolean;
	/** @name Disabled @default false */ disabled?: boolean;
	/** @name Handle Change @ignore */ handleChange?: React.EventHandler<
		React.ChangeEvent<HTMLInputElement>
	>;
}

interface StyledLabelProps {
	disabled?: boolean;
}

interface StyledRadioProps {
	checked?: boolean;
	disabled?: boolean;
}

const StyledRadioInput = styled.input`
	position: absolute;
	left: -100vw;
`;

const StyledLabel = styled.label`
	display: flex;
	align-items: center;
	color: ${Color.Black};

	${(props: StyledLabelProps) => (props.disabled ? `color: ${Color.Grey90};` : '')};
`;

const StyledRadio = styled.div`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 34px;
	height: 34px;
	border: 1px solid ${Color.Grey70};
	border-radius: 50%;

	${(props: StyledRadioProps) => (props.disabled ? `border-color: ${Color.Grey90};` : '')};

	/* RadioIndicator */
	::before {
		${(props: StyledRadioProps) => (props.checked ? 'display: block;' : 'display: none;')};
		content: '';
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: ${Color.Green};
	}
`;

const StyledLabelText = styled(Copy)`
	padding-left: 12px;
`;

/**
 * @icon Disc
 */
export const Radio: React.SFC<RadioProps> = props => {
	const { disabled, groupName, value, handleChange, checked, labelText } = props;
	return (
		<StyledLabel disabled={disabled}>
			<StyledRadioInput type="radio" name={groupName} value={value} onChange={handleChange} />
			<StyledRadio checked={checked} disabled={disabled} />
			{labelText && <StyledLabelText>{labelText}</StyledLabelText>}
		</StyledLabel>
	);
};
