import * as React from 'react';
import * as D from './components';
import { Releases } from './releases';
import * as Icon from 'react-feather';
import styled from '@emotion/styled';

const StyledVideoOverlay = styled.div`
	display: flex;
	flex-wrap: wrap;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10;

	background-color: ${D.Color.Black};
`;

export class Hero extends React.Component {
	public state = {
		video: false
	};

	private handleChange(foo: boolean): void {
		console.log(foo);
		this.setState({
			video: foo
		});
	}

	public render(): JSX.Element {
		return (
			<D.Hero backgroundColor={D.Color.Black} textColor={D.Color.White}>
				{this.state.video && (
					<StyledVideoOverlay>
						<a
							onClick={e => this.handleChange(false)}
							href=""
							style={{ display: 'block', height: '45px', margin: '20px' }}
						>
							<Icon.XCircle size={45} color={D.Color.White} />
						</a>
						<iframe
							id="missionViode"
							src="https://www.youtube-nocookie.com/embed/gZT13EKfZXg?modestbranding=1&rel=0&autoplay=1"
							style={{
								width: '100%',
								height: 'calc(100% - 85px)',
								borderWidth: 0
							}}
							allowFullScreen
						/>
					</StyledVideoOverlay>
				)}

				<D.Menu logo="https://media.meetalva.io/alva.svg" badge="Beta v0.9.1">
					<D.MenuItem
						linkName="Learn"
						target="_blank"
						rel="noopener"
						href="./doc/docs/guides/start?guides-enabled=true"
						title="Open Getting Started Tutorial"
					/>
					<D.MenuItem linkName="Our Mission" rel="noopener" href="#" title="Our Mission" />
					<D.MenuItem
						linkName="Chat with us"
						target="_blank"
						rel="noopener"
						href="https://gitter.im/meetalva/Lobby"
						title="Chat with us on Gitter"
					/>
				</D.Menu>

				<D.Space size={D.SpaceSize.L} />

				<D.Layout maxWidth="960px" center>
					<D.Headline level={D.HeadlineLevel.H1} textAlign={D.TextAlign.Center}>
						Create <u>interactive prototypes</u> with your design system.
					</D.Headline>
				</D.Layout>

				<D.Space size={D.SpaceSize.S} />
				<D.Space size={D.SpaceSize.S} />

				<D.Layout maxWidth="640px" direction={D.LayoutDirection.Vertical} center>
					<D.Copy size={D.CopySize.Large} textAlign={D.TextAlign.Center}>
						Your team's shared space for scaled product production. design-dev collaboration.
						open platfor, open-source. continous improvement.
					</D.Copy>

					<D.Space size={D.SpaceSize.L} />

					<div style={{ display: 'flex', justifyContent: 'space-evenly', flexWrap: 'wrap' }}>
						<Releases />
						<D.Button onClick={e => this.handleChange(true)} order={D.ButtonOrder.Secondary}>
							Watch mission video
						</D.Button>
					</div>
				</D.Layout>

				<D.Space size={D.SpaceSize.XL} />
			</D.Hero>
		);
	}
}
