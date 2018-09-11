import * as React from 'react';
import styled from 'styled-components';
import { PropertyInput } from '../property-input';

export interface FileInputProps {
	accept?: string[];
}

export class FileInput extends React.Component<FileInputProps> {
	public static ButtonSlot: React.SFC = props => <>{props.children}</>;
	public static InputSlot: React.SFC = props => <>{props.children}</>;

	public render(): JSX.Element {
		const { props } = this;

		const buttonSlot = React.Children.toArray(props.children).find(
			child => typeof child === 'object' && child.type === FileInput.ButtonSlot
		);

		const inputSlot = React.Children.toArray(props.children).find(
			child => typeof child === 'object' && child.type === FileInput.InputSlot
		);

		return (
			<StyledLabel>
				<HiddenFileInput type="file" accept={(props.accept || []).join(', ')} />
				{inputSlot}
				{buttonSlot}
			</StyledLabel>
		);
	}
}

export const DefaultFileInputInput: React.SFC = () => <PropertyInput />;

const StyledLabel = styled.label`
	display: flex;
	vertical-align: middle;
	position: relative;
`;

const HiddenFileInput = styled.input.attrs({ type: 'file' })`
	position: fixed;
	top: 100vh;
	left: 100vw;
`;
