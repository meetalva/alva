import * as React from 'react';
import { PropertyInput, PropertyInputType } from '../property-input';
import { PropertyItem } from '../property-item';
import { SketchPicker } from 'react-color';

import styled, { css } from 'styled-components';

export interface PropertyItemColorProps {
	className?: string;
	description?: string;
	label: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler;
	onShow?: React.MouseEventHandler;
	onHide?: React.MouseEventHandler;
	placeholder?: string;
	color?: string;
	show?: boolean;

	onColorPickerChange?: any;
	onColorPickerChangeComplete?: any;
}

export interface PropertyItemColorSwatchProps {
	color?: string;
}

const StyledSwatchColor = styled.div`
	position: absolute;
	right: 5px;
	top: 5px;
	z-index: 10;

	width: 30px;
	height: 20px;
	border-radius: 3px;
	border: 0.5px solid rgba(0, 0, 0, 0.2);
	background-color: ${(props: PropertyItemColorSwatchProps) => props.color};
`;

const StyledPropertyOverlay = styled.div`
	position: absolute;
	top: 32px;
	right: 0;

	.sketch-picker {
		padding 10px 10px 5px 10px !important;
	  }

	.sketch-picker > :nth-of-type(2) > :nth-of-type(1) > :nth-of-type(2),
	.sketch-picker > :nth-of-type(2) > :nth-of-type(2),
	.sketch-picker > :nth-of-type(3) > :nth-of-type(5),
	.sketch-picker > :nth-of-type(4) {
		display: none !important;
	}
`;

export const PropertyItemColor: React.StatelessComponent<PropertyItemColorProps> = props => (
	<>
		<PropertyItem description={props.description} label={props.label}>
			<StyledSwatchColor color={props.color} />
			<PropertyInput
				onFocus={props.onFocus}
				onChange={props.onChange}
				onBlur={props.onBlur}
				onClick={props.onShow}
				type={PropertyInputType.Text}
				value={props.color}
				placeholder={props.placeholder}
			/>
			{props.show && (
				<StyledPropertyOverlay>
					<div style={{ position: 'relative', zIndex: 50 }}>
						<SketchPicker
							color={props.color}
							onChange={props.onColorPickerChange}
							onChangeComplete={props.onColorPickerChangeComplete}
						/>
					</div>
				</StyledPropertyOverlay>
			)}
		</PropertyItem>
	</>
);
