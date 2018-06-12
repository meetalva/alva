import { Color } from '../colors';
import { Icon, IconName, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';
import { tag } from '../tag';

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
	Highlighted = 'highlighted'
}

export interface ElementProps {
	children?: React.ReactNode;
	contentId: string;
	draggable: boolean;
	dragging: boolean;
	id: string;
	mayOpen: boolean;
	onChange: React.FormEventHandler<HTMLInputElement>;
	open: boolean;
	placeholder: boolean;
	placeholderHighlighted?: boolean;
	state: ElementState;
	title: string;
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
}

export interface StyledElementChildProps {
	open: boolean;
}

const StyledElement = styled.div`
	position: relative;
	z-index: 1;
`;

const div = tag('div').omit(['active', 'highlight']);

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

const StyledElementLabel = styled(div)`
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

interface StyledPlaceholderProps {
	visible: boolean;
}

const PLACEHOLDER_SCALE = (props: StyledPlaceholderProps): number => (props.visible ? 1 : 0);

const StyledPlaceholder = styled.div`
	position: relative;
	height: ${getSpace(SpaceSize.S)}px;
	width: 100%;
	margin-top: -${getSpace(SpaceSize.XS)}px;
	margin-bottom: -${getSpace(SpaceSize.XS)}px;
	z-index: 10;

	&::before {
		content: '';
		display: block;
		position: absolute;
		height: 6px;
		width: 6px;
		left: 0;
		top: 3px;
		border-radius: 3px;
		background: ${Color.Blue40};
		transform: scale(${PLACEHOLDER_SCALE});
		transition: transform 0.2s;
		z-index: 20;
	}

	&::after {
		content: '';
		display: block;
		position: absolute;
		height: 2px;
		width: calc(100% - 6px);
		left: ${getSpace(SpaceSize.XS)};
		top: 5px;
		background: ${Color.Blue40};
		transform: scaleY(${PLACEHOLDER_SCALE});
		transition: transform 0.2s;
		z-index: 20;
	}
`;

const elementDiv = tag('div').omit(['open']);

const StyledElementChildren = styled(elementDiv)`
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
	cursor: ${(props: LabelContentProps) => (props.active ? 'text' : 'default')};
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
				innerRef={ref => (this.ref = ref)}
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
			<StyledElement {...anchors} draggable={props.draggable}>
				{props.placeholder &&
					props.dragging && (
						<StyledPlaceholder
							{...{ [ElementAnchors.placeholder]: true }}
							visible={Boolean(props.placeholderHighlighted)}
						/>
					)}
				<StyledElementLabel state={props.state}>
					{props.mayOpen && (
						<StyledIcon
							dataIcon={props.id}
							name={IconName.ArrowFillRight}
							size={IconSize.XXS}
							color={Color.Grey60}
							open={props.open}
							active={props.state === ElementState.Active}
						/>
					)}
					{props.state === ElementState.Editable ? (
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
							{...{ [ElementAnchors.label]: true }}
						>
							{props.title}
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
