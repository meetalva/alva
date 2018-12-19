import * as React from 'react';
import { PropertyInputStyles } from '../property-input';
import { PropertyItem } from '../property-item';
const { Link2 } = require('react-feather');
import styled, { StyledComponentClass } from 'styled-components';
import { Color } from '../colors';
import * as TextareaAutosize from 'react-textarea-autosize';

export interface PropertyItemStringProps {
	className?: string;
	description?: string;
	label: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
	placeholder?: string;
	value?: string;
	children?(renderProps: PropertyItemStringProps): JSX.Element | null;
}

// tslint:disable-next-line:no-any
export const LinkIcon: StyledComponentClass<{}, {}, any> = styled(Link2)`
	position: absolute;
	top: 15px;
	transform: translateY(-50%);
	right: 0;
	box-sizing: border-box;
	padding: 3px 6px 3px 0;
	width: 20px;
	cursor: pointer;
	transition: stroke 0.3s ease-in-out;
	stroke: ${Color.Grey60};
	&:hover {
		stroke: ${Color.Blue20};
	}
`;

const StyledTextArea = styled(TextareaAutosize.default)`
	resize: none;
	${PropertyInputStyles};
`;

export const PropertyItemString: React.StatelessComponent<PropertyItemStringProps> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<StyledTextArea
			onChange={props.onChange}
			onBlur={props.onBlur}
			useCacheForDOMMeasurements
			value={props.value || ''}
			placeholder={props.placeholder}
		/>
	</PropertyItem>
);
