import * as React from 'react';

export interface TextProps {
	/****** Group: Content *******/

	/**
	 * @name Text
	 * @default Lorem ipsum dolor sit amet, consectetur adipiscing elit.
	 * @group Content
	 */
	text: string;

	/**
	 * @name Custom Styles
	 * @default true
	 * @description Use parent styling rules or set custom styles.
	 * @group Content
	 * @control ButtonGroup
	 */
	customStyles: boolean;

	/****** Group: Typography *******/

	/**
	 * @name Font
	 * @default Helvetica, Arial, sans-serif
	 * @group Typography
	 */
	fontFamily: string;

	/**
	 * @name Style
	 * @group Typography
	 * @control ButtonGroup
	 */
	fontStyle: fontStyle;

	/**
	 * @name Size
	 * @default 14px
	 * @group Typography
	 */
	size: string;

	/**
	 * @name Line-Height
	 * @default 20px
	 * @group Typography
	 */
	lineHeight: string;

	/**
	 * @name Color
	 * @default #000000
	 * @group Typography
	 * @control color
	 */
	color: string;

	/**
	 * @name Align
	 * @default Left
	 * @group Typography
	 * @control ButtonGroup
	 */
	align: align;
}

export enum align {
	/** @name Left @icon AlignLeft */
	Left = 'left',
	/** @name Center @icon AlignCenter */
	Center = 'center',
	/** @name Right @icon AlignRight */
	Right = 'right',
	/** @name Justify  @icon AlignJustify */
	Justify = 'justify'
}

export enum fontStyle {
	/** @name Bold @icon Bold */
	Bold,
	/** @name Italic @icon Italic  */
	Italic,
	/** @name Underline @icon Underline */
	Underline
}

/**
 * @name Text
 * @description for Headlines, Copy and more
 * @icon Type
 * @patternType synthetic:text
 */
export const Text: React.SFC<TextProps> = props => {
	return (
		<span
			style={{
				display: 'inline-block',
				fontFamily: props.customStyles ? props.fontFamily : '',
				fontWeight: props.customStyles
					? props.fontStyle === fontStyle.Bold
						? 'bold'
						: 'inherit'
					: 'inherit',
				fontStyle: props.customStyles
					? props.fontStyle === fontStyle.Italic
						? 'italic'
						: 'inherit'
					: 'inherit',
				textDecoration: props.customStyles
					? props.fontStyle === fontStyle.Underline
						? 'underline'
						: ''
					: 'inherit',
				fontSize: props.customStyles ? props.size : '',
				lineHeight: props.customStyles ? props.lineHeight : '',
				color: props.customStyles ? props.color : '',
				textAlign: props.customStyles ? props.align : 'inherit'
			}}
		>
			{props.text}
		</span>
	);
};
