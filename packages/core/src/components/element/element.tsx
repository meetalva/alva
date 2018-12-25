import { Color } from '../colors';
import { Icon, IconName, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';
import { TargetSignal } from '../drag-area';

export const ElementAnchors = {
	element: 'data-id',
	content: 'data-content-id',
	icon: 'data-icon',
	label: 'data-element-label',
	placeholder: 'data-element-placeholder'
};

export enum ElementState {
	Default = 'default',
	Editable = 'editable',
	Active = 'active',
	Disabled = 'disabled',
	Highlighted = 'highlighted',
	Focused = 'focused'
}

export enum ElementCapability {
	Draggable = 'draggable',
	Editable = 'editable',
	Openable = 'openable'
}

export interface ElementProps {
	capabilities: ElementCapability[];
	children?: React.ReactNode;
	contentId: string;
	dragging: boolean;
	id: string;
	onChange: React.FormEventHandler<HTMLInputElement>;
	open: boolean;
	placeholder: boolean;
	placeholderHighlighted?: boolean;
	state: ElementState;
	title: string;
	description?: string;
}

interface StyledElementLabelProps {
	state: ElementState;
}

interface StyledIconProps {
	active: boolean;
	open: boolean;
}

interface LabelContentProps {
	active: boolean;
	editable?: boolean;
}

export interface StyledElementChildProps {
	open: boolean;
}

const StyledElement = styled.div`
	position: relative;
	z-index: 1;
`;

const LABEL_COLOR = (props: StyledElementLabelProps): string => {
	switch (props.state) {
		case ElementState.Active:
		case ElementState.Editable:
			return Color.Blue;
		case ElementState.Disabled:
			return Color.Grey60;
		default:
			return 'inherit';
	}
};

const LABEL_BACKGROUND = (props: StyledElementLabelProps): string => {
	switch (props.state) {
		case ElementState.Active:
		case ElementState.Editable:
			return Color.Blue80;
		case ElementState.Highlighted:
			return Color.Grey90;
		default:
			return 'transparent';
	}
};

const StyledElementLabel = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	font-size: 15px;
	line-height: 21px;
	z-index: 1;
	color: ${LABEL_COLOR};
	background: ${LABEL_BACKGROUND};
	&::before {
		content: '';
		display: block;
		position: absolute;
		z-index: -1;
		top: 0;
		right: 100%;
		height: 100%;
		width: 100vw;
		background: inherit;
	}
`;

const StyledElementChildren = styled.div`
	flex-basis: 100%;
	padding-left: ${getSpace(SpaceSize.L)}px;
`;

const StyledIcon = styled(Icon)`
	position: absolute;
	left: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px;
	fill: ${Color.Grey60};
	width: ${getSpace(SpaceSize.S)}px;
	height: ${getSpace(SpaceSize.S)}px;
	padding: ${getSpace(SpaceSize.XS)}px;
	transition: transform 0.2s;

	${(props: StyledIconProps) => (props.open ? 'transform: rotate(90deg)' : '')};
	${(props: StyledIconProps) => (props.active ? `fill: ${Color.Blue20}` : '')};
`;

const LabelContent = styled.div`
	box-sizing: border-box;
	margin-left: ${getSpace(SpaceSize.XXL) - 3}px;
	overflow: hidden;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.L)}px ${getSpace(SpaceSize.XS)}px 3px;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
	cursor: ${(props: LabelContentProps) => (props.active && props.editable ? 'text' : 'default')};
	user-select: none;
`;

const StyledSeamlessInput = styled.input`
	box-sizing: border-box;
	width: 100%;
	color: ${Color.Grey20};
	font-size: inherit;
	line-height: inherit;
	padding: ${getSpace(SpaceSize.XS - 1)}px ${getSpace(SpaceSize.L - 1)}px
		${getSpace(SpaceSize.XS - 1)}px 3px;
	margin: 1px 1px 1px ${getSpace(SpaceSize.XXL - 3)}px;
	border: 0;
	&:focus {
		outline: none;
	}
`;

const StyledElementDescription = styled.div`
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	box-sizing: border-box;
	color: ${Color.Grey60};
	padding: 0 ${getSpace(SpaceSize.M)}px 0 ${getSpace(SpaceSize.XS)}px;
	font-size: 12px;
	justify-self: flex-end;
	max-width: 50%;
	padding-left: 30px;
	padding-right: 18px;
	overflow: hidden;
	text-overflow: ellipsis;

	&::before {
		content: '';
		position: absolute;
		z-index: -1;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		mask-image: linear-gradient(to right, transparent, black 25px, black);
		background: ${LABEL_BACKGROUND};
	}
`;

interface SeamlessInputProps {
	autoFocus?: boolean;
	autoSelect?: boolean;
	onChange?: React.FormEventHandler<HTMLInputElement>;
	value: string;
}

class SeamlessInput extends React.Component<SeamlessInputProps> {
	private ref: HTMLInputElement | null = null;

	public componentDidMount(): void {
		if (this.ref !== null && this.props.autoSelect && this.props.autoFocus) {
			const ref = this.ref as HTMLInputElement;
			ref.setSelectionRange(0, this.props.value.length);
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<StyledSeamlessInput
				autoFocus={props.autoFocus}
				ref={(ref: any) => (this.ref = ref)}
				value={props.value}
				onChange={props.onChange}
			/>
		);
	}
}

export class Element extends React.Component<ElementProps> {
	public static ElementChildren: React.SFC = props => <>{props.children}</>;
	public static ElementSlots: React.SFC = props => <>{props.children}</>;

	public render(): JSX.Element | null {
		const { props } = this;

		const anchors = {
			[ElementAnchors.content]: props.contentId,
			[ElementAnchors.element]: props.id
		};

		return (
			<StyledElement
				{...anchors}
				draggable={props.capabilities.includes(ElementCapability.Draggable)}
			>
				{props.placeholder &&
					props.dragging && (
						<TargetSignal
							{...{ [ElementAnchors.placeholder]: true }}
							visible={Boolean(props.placeholderHighlighted)}
						/>
					)}
				<StyledElementLabel state={props.state}>
					{props.capabilities.includes(ElementCapability.Openable) && (
						<StyledIcon
							dataIcon={props.id}
							name={IconName.ArrowFillRight}
							size={IconSize.XXS}
							color={Color.Grey60}
							open={props.open}
							active={props.state === ElementState.Active}
						/>
					)}
					{props.state === ElementState.Editable &&
					props.capabilities.includes(ElementCapability.Editable) ? (
						<SeamlessInput
							{...{ [ElementAnchors.label]: true }}
							value={props.title}
							onChange={props.onChange}
							autoFocus
							autoSelect
						/>
					) : (
						<LabelContent
							active={props.state === ElementState.Active}
							editable={props.capabilities.includes(ElementCapability.Editable)}
							{...{ [ElementAnchors.label]: true }}
						>
							{props.title}
							{props.description && (
								<StyledElementDescription state={props.state}>
									{props.description}
								</StyledElementDescription>
							)}
						</LabelContent>
					)}
				</StyledElementLabel>
				<StyledElementChildren>
					{props.open && containered(props.children, Element.ElementSlots)}
					{props.open && containered(props.children, Element.ElementChildren)}
				</StyledElementChildren>
			</StyledElement>
		);
	}
}

function containered<T>(children: React.ReactNode, Container: React.SFC): React.ReactElement<T>[] {
	return React.Children.map(children, child => {
		if (child === null) {
			return;
		}

		if (typeof child !== 'object') {
			return;
		}

		if (!child.hasOwnProperty('type')) {
			return;
		}

		if (child.type !== Container) {
			return;
		}

		return child;
	}).filter((child): child is React.ReactElement<T> => typeof child !== 'undefined');
}
