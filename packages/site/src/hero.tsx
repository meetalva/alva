import * as React from 'react';
// import * as D from './components';
// import { Releases } from './releases';
// import * as Icon from 'react-feather';

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
		return this.state.video ? (
			<div onClick={e => this.handleChange(true)}>Hannes</div>
		) : (
			<div onClick={e => this.handleChange(false)}>kuchen</div>
		);
	}
}

// export class Hero extends React.Component {

// 	public render() {

// 		return (
// 			<D.Hero backgroundColor={D.Color.Black} textColor={D.Color.White}>

// 				<div style={{ width: '90vw', height: '100vh', margin: '0 auto', textAlign: 'right'}}>
// 					<a id="closeMissionVideo" href="" style={{display: 'inline-block', height: '8vh', marginTop: '2vh', marginRight: '5vw'}}>
// 						<Icon.XCircle size={45} color={D.Color.White} />
// 					</a>
// 					<iframe
// 						id="missionViode"
// 						src="https://www.youtube-nocookie.com/embed/gZT13EKfZXg?modestbranding=1&rel=0"
// 						style={{
// 							width: '100%',
// 							height: '85vh',
// 							borderWidth: 0
// 						}}
// 						allowFullScreen
// 					/>
// 				</div>

// 				<div>
// 					<D.Menu logo="https://media.meetalva.io/alva.svg" badge="Beta v0.9.1">
// 						<D.MenuItem
// 							linkName="Learn"
// 							target="_blank"
// 							rel="noopener"
// 							href="./doc/docs/guides/start?guides-enabled=true"
// 							title="Open Getting Started Tutorial"
// 						/>
// 						<D.MenuItem linkName="Our Mission" rel="noopener" href="#" title="Our Mission" />
// 						<D.MenuItem linkName="About us" rel="noopener" href="#" title="About us" />
// 					</D.Menu>

// 					<D.Space size={D.SpaceSize.L} />

// 					<D.Layout maxWidth="960px" center>
// 						<D.Headline level={D.HeadlineLevel.H1} textAlign={D.TextAlign.Center}>
// 							Create <u>interactive prototypes</u> with your design system.
// 						</D.Headline>
// 					</D.Layout>

// 					<D.Space size={D.SpaceSize.S} />
// 					<D.Space size={D.SpaceSize.S} />

// 					<D.Layout maxWidth="640px" direction={D.LayoutDirection.Vertical} center>
// 						<D.Copy size={D.CopySize.Large} textAlign={D.TextAlign.Center}>
// 							Your team's shared space for scaled product production. design-dev collaboration. open platfor, open-source. continous improvement.
// 						</D.Copy>

// 						<D.Space size={D.SpaceSize.L} />

// 						<div style={{ display: 'flex', justifyContent: 'space-evenly', flexWrap: 'wrap' }}>
// 							<Releases />
// 							<D.Button order={D.ButtonOrder.Secondary}>Watch mission video</D.Button>
// 						</div>
// 					</D.Layout>

// 					<D.Space size={D.SpaceSize.XL} />

// 				</div>

// 			</D.Hero>
// 		);
// 	}
// }
