import { Tutorial, Headline, Copy, Color, Space, SpaceSize } from '../components';
import * as React from 'react';

export interface TutorialState {
	currentIndex: number;
}

const values = [
	{
		title: 'Welcome',
		description: 'This tutorial will cover the essentials of using Alva. Click to start!'
	},
	{
		title: 'Add a Component',
		description:
			'Drag the Box component from the library on the bottom left to the element list above'
	},
	{
		title: 'Adjust the Properties',
		description:
			'Set the width of the component to "100%". You can enter absolute values (like 30px) or relative values (like 30%)'
	},
	{
		title: 'Add a Text',
		description:
			'Drag the Text component into the Box. You can set the text value to "Hello World"'
	},
	{
		title: 'Export the Prototype',
		description:
			'Click on the right top on "Export". You can open this HTML-File with any browser on any device.'
	},
	{
		title: 'Learn more',
		description: 'You can find some more guides on our website: meetalva.io'
	}
];

export class TutorialContainer extends React.Component<{}, TutorialState> {
	public state = {
		currentIndex: 0
	};

	private next(): void {
		this.setState({
			currentIndex: this.state.currentIndex + 1
		});
	}

	private previous(): void {
		this.setState({
			currentIndex: this.state.currentIndex - 1
		});
	}

	public render(): JSX.Element {
		return (
			<Tutorial
				onLeftClick={this.state.currentIndex !== 0 ? () => this.previous() : undefined}
				onRightClick={
					this.state.currentIndex < values.length - 1 ? () => this.next() : undefined
				}
				onFinishClick={() => alert('Finish!')}
				progress={(this.state.currentIndex + 1) / values.length}
			>
				<Headline order={3}>{values[this.state.currentIndex].title}</Headline>
				<Space size={SpaceSize.S} />
				<Copy textColor={Color.Grey60}>{values[this.state.currentIndex].description}</Copy>
				<Space size={SpaceSize.XXS} />
			</Tutorial>
		);
	}
}
