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

				<D.Menu logo="https://media.meetalva.io/alva.svg" badge="Pre-Release">
					<D.MenuItem
						target="_blank"
						rel="noopener"
						href="./doc/docs/start"
						title="Open Getting Started Tutorial"
					>
						Learn
					</D.MenuItem>
					<D.MenuItem
						target="_blank"
						rel="noopener"
						href="./doc/docs/about-us"
						title="About us"
					>
						About&nbsp;Us
					</D.MenuItem>
					<D.MenuItem
						target="_blank"
						rel="noopener"
						href="https://gitter.im/meetalva/Lobby"
						title="Chat with us on Gitter"
					>
						Chat with us
					</D.MenuItem>
					<D.MenuItem
						target="_blank"
						rel="noopener"
						href="https://github.com/meetalva/alva"
						title="MeetAlva on GitHub"
					>
						<svg height="32" width="32" viewBox="0 0 16 16" aria-hidden="true">
							<path
								fill-rule="evenodd"
								fill="white"
								d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
							/>
						</svg>
					</D.MenuItem>
				</D.Menu>

				<D.Space size={D.SpaceSize.L} />

				<div style={{ padding: '0 5%' }}>
					<D.Layout maxWidth="960px" center>
						<D.Headline level={D.HeadlineLevel.H1} textAlign={D.TextAlign.Center}>
							Create <u>interactive prototypes</u> with your design system.
						</D.Headline>
					</D.Layout>

					<D.Space size={D.SpaceSize.M} />

					<D.Layout maxWidth="640px" direction={D.LayoutDirection.Vertical} center>
						<D.Copy size={D.CopySize.Large} textAlign={D.TextAlign.Center}>
							Liberate your product teams from many chores of maintenance to focus more on
							innovation.
						</D.Copy>

						<D.Space size={D.SpaceSize.M} />

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-evenly',
								flexWrap: 'wrap',
								maxWidth: '540px',
								margin: '0 auto'
							}}
						>
							<div style={{ margin: '10px' }}>
								<Releases />
							</div>
							<div style={{ margin: '10px' }}>
								<D.Button
									onClick={e => this.handleChange(true)}
									order={D.ButtonOrder.Secondary}
								>
									Watch mission video
								</D.Button>
							</div>
						</div>
					</D.Layout>
				</div>

				<D.Space size={D.SpaceSize.XL} />
			</D.Hero>
		);
	}
}
