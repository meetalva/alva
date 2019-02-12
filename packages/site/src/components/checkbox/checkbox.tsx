import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { Copy } from '../copy';

/**
 * @name Checkbox
 */

export interface CheckboxProps {
	/** @name Label Text @default Lorem Ipsum */ labelText?: string;
	/** @name Name @ignore */ name?: string;
	/** @name Value @ignore */ value?: string;
	/** @name Checked @default false */ checked?: boolean;
	/** @name Disabled @default false */ disabled?: boolean;
	/** @name Handle Change @ignore */ handleChange?: React.EventHandler<
		React.ChangeEvent<HTMLInputElement>
	>;
}

interface StyledLabelProps {
	disabled?: boolean;
}

interface StyledCheckboxProps {
	disabled?: boolean;
}

interface StyledCheckmarkProps {
	checked?: boolean;
	disabled?: boolean;
}

const StyledLabel = styled.label`
	display: flex;
	align-items: center;
	color: ${Color.Black};

	${(props: StyledLabelProps) => (props.disabled ? `color: ${Color.Grey90};` : '')};
`;

const StyledCheckboxInput = styled.input`
	position: absolute;
	left: -100vw;
`;

const StyledCheckbox = styled.div`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 34px;
	height: 34px;
	border: 1px solid ${Color.Grey70};
	border-radius: 3px;

	${(props: StyledCheckboxProps) => (props.disabled ? `border-color: ${Color.Grey90};` : '')};
`;

const SyledCheckmark = styled.svg`
	${(props: StyledCheckmarkProps) => (props.checked ? 'display: block;' : 'display: none;')};
	${(props: StyledCheckmarkProps) =>
		props.disabled ? `fill: ${Color.Grey90};` : `fill: ${Color.Green};`};
`;

const StyledLabelText = styled(Copy)`
	padding-left: 12px;
`;

/**
 * @icon CheckSquare
 */
export const Checkbox: React.SFC<CheckboxProps> = (props): JSX.Element => {
	const { disabled, name, value, handleChange, checked, labelText } = props;
	return (
		<StyledLabel disabled={disabled}>
			<StyledCheckboxInput type="checkbox" name={name} value={value} onChange={handleChange} />
			<StyledCheckbox disabled={disabled}>
				{/* TODO: move svg to icons component */}
				<SyledCheckmark
					checked={checked}
					disabled={disabled}
					xmlns="http://www.w3.org/2000/svg"
					width="34"
					height="34"
				>
					<path d="M13.899495 23.33452l-6.717514-6.71751c-.585787-.58579-1.535534-.58579-2.121321 0-.585786.58579-.585786 1.53553 0 2.12132l7.778175 7.77817c.292893.2929.676776.43934 1.06066.43934.383883 0 .767767-.14644 1.06066-.43934l15.556349-15.55634c.585787-.58579.585787-1.53554 0-2.12133-.585786-.58578-1.535534-.58578-2.12132 0L13.899495 23.33452z" />
				</SyledCheckmark>
			</StyledCheckbox>
			{labelText && <StyledLabelText>{labelText}</StyledLabelText>}
		</StyledLabel>
	);
};
