import * as React from 'react';
import { Helmet } from 'react-helmet';
import * as D from '@meetalva/alva-design';
import { Releases } from './releases';

export * from './render';

const Page: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<div style={{ overflow: 'hidden' }}>
			<Helmet>
				<title>Meet Alva</title>
				<meta charSet="utf-8" />
				<meta property="og:type" content="website" />
				<meta
					property="og:description"
					content="Create living prototypes with code components."
				/>
				<meta property="og:image" content="https://media.meetalva.io/meta/og_image.png" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@meetalva" />
				<meta name="twitter:title" content="Meet Alva" />
				<meta
					name="twitter:description"
					content="Create living prototypes with code components."
				/>
				<meta name="twitter:image" content="https://media.meetalva.io/meta/og_image.png" />
				<meta name="language" content="en" />
				<meta
					name="description"
					content="Create living prototypes with code components. Design with the same components your engineers are using for production."
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, user-scalable=yes"
				/>
				<link rel="icon" href="https://media.meetalva.io/meta/icon_48.png" sizes="48x48" />
				<link rel="icon" href="https://media.meetalva.io/meta/icon_96.png" sizes="96x96" />
				<link rel="icon" href="https://media.meetalva.io/meta/icon_192.png" sizes="192x192" />
				<link rel="icon" href="https://media.meetalva.io/alva.svg" type="image/x-icon" />
			</Helmet>
			<D.Menu logo="https://media.meetalva.io/alva.svg">
				<D.MenuItem
					linkName="Get Started"
					target="_blank"
					rel="noopener"
					href="./doc/docs/start"
					title="Open Getting Started Tutorial"
				/>
				<D.MenuItem
					linkName="Twitter"
					target="_blank"
					rel="noopener"
					href="https://twitter.com/meetalva"
					title="Find us on Twitter"
				/>
				<D.MenuItem
					linkName="Github"
					target="_blank"
					rel="noopener"
					href="https://github.com/meetalva/alva"
					title="Find us on Github"
				/>
				<D.MenuItem
					linkName="Gitter"
					target="_blank"
					rel="noopener"
					href="https://gitter.im/meetalva/Lobby"
					title="Chat with us on Gitter"
				/>
			</D.Menu>
			<D.Section backgroundColor={D.Color.Black} textColor={D.Color.White}>
				<D.Headline level={D.HeadlineLevel.H1}>
					Create <u>living prototypes</u> with code components.
				</D.Headline>
				<D.Space size={D.SpaceSize.M} />
				<D.Layout maxWidth="640px">
					<D.Copy size={D.CopySize.Large}>
						Alva lets you design interactive products based on components engineered by your
						developers. And guess what – we are entirely open source.
					</D.Copy>
				</D.Layout>
				<D.Space size={D.SpaceSize.L} />
				<Releases />
				<D.Space size={D.SpaceSize.XL} />
			</D.Section>
			<D.Feature
				featureLevel={D.FeatureLevel.Large}
				headline="Start your prototype with code components"
				copy="Connect to the components of your React library and start using them for your prototype. Without writing a single line of code."
				layout={D.FeatureLayout.Center}
				frame={
					<video controls autoPlay loop style={{ display: 'block', width: '100%' }}>
						<source src="https://media.meetalva.io/video/website-01.mp4" type="video/mp4" />
					</video>
				}
				link={
					<a
						href="./doc/docs/guides/essentials?guides-enabled=true"
						style={{ textDecoration: 'none' }}
						target="_blank"
						rel="noopener"
					>
						<D.Link color={D.Color.Violet}>
							Learn how to prototype with code components
						</D.Link>
					</a>
				}
				negativeTop
			/>
			<D.Space size={D.SpaceSize.XL} />
			<D.Feature
				featureLevel={D.FeatureLevel.Large}
				headline="Integrate your visual design drafts"
				copy="Add your latest design drafts from Sketch, Figma or any other design tool to your prototype and show your team how the next component should look like."
				layout={D.FeatureLayout.Left}
				frame={
					<img
						src="https://media.meetalva.io/video/website-02.png"
						style={{ display: 'block' }}
					/>
				}
				link={
					<a
						href="./doc/docs/guides/design?guides-enabled=true"
						style={{ textDecoration: 'none' }}
						target="_blank"
						rel="noopener"
					>
						<D.Link color={D.Color.Violet}>Learn how to integrate your designs</D.Link>
					</a>
				}
			/>
			<D.Space size={D.SpaceSize.XL} />
			<D.Feature
				featureLevel={D.FeatureLevel.Large}
				headline="Connect everything with interactions"
				copy="The web is interactive – so let’s design interactively, too. Go beyond static screens and design with interaction, data and logic in mind."
				layout={D.FeatureLayout.Right}
				frame={
					<img
						src="https://media.meetalva.io/video/website-03.png"
						style={{ display: 'block' }}
					/>
				}
				link={
					<a
						href="./doc/docs/guides/interaction?guides-enabled=true"
						style={{ textDecoration: 'none' }}
						target="_blank"
						rel="noopener"
					>
						<D.Link color={D.Color.Violet}>Learn how to work with interactions</D.Link>
					</a>
				}
			/>
			<D.Space size={D.SpaceSize.XL} />
			<D.Feature
				featureLevel={D.FeatureLevel.Medium}
				headline="Sketch Integration (coming soon)"
				copy="Integrate Sketch into your prototyping workflow and seamlessly export code to Sketch and import your design drafts to the prototype. Coming later this year."
				layout={D.FeatureLayout.Center}
			/>
			<D.Space size={D.SpaceSize.XL} />
			<D.Space size={D.SpaceSize.XL} />

			<D.Teaser
				image="https://media.meetalva.io/background.jpg"
				headline="Our mission is to enable designers and engineers to build better products together. Without friction."
			>
				<div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
					<iframe
						src="https://www.youtube-nocookie.com/embed/gZT13EKfZXg"
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							borderWidth: 0
						}}
						allowFullScreen
					/>
				</div>
			</D.Teaser>

			<D.Section>
				<D.Layout maxWidth="480px" direction={D.LayoutDirection.Vertical}>
					<D.Headline
						level={D.HeadlineLevel.H3}
						color={D.Color.Violet}
						fontWeight={D.FontWeight.Light}
					>
						Stay tuned!
					</D.Headline>
					<D.Space size={D.SpaceSize.S} />
					<D.Copy>
						Alva is constantly evolving. Sign up with your email to be the first in line when
						we announce new features.
					</D.Copy>
					<D.Space size={D.SpaceSize.M} />
					<div id="mc_embed_signup">
						<form
							action="https://alva.us17.list-manage.com/subscribe/post?u=8f07560758ff52583a4f34f45&amp;id=d598cf405b"
							method="post"
							id="mc-embedded-subscribe-form"
							name="mc-embedded-subscribe-form"
							target="_blank"
							noValidate
						>
							<div
								id="mc_embed_signup_scroll"
								style={{
									display: 'flex'
								}}
							>
								<input
									type="email"
									name="EMAIL"
									id="mce-EMAIL"
									placeholder="Email address"
									required
									style={{
										fontFamily: 'Graphik, Arial',
										fontSize: '16px',
										padding: '10px 15px',
										border: `1px solid ${D.Color.Grey50}`,
										borderRightWidth: 0,
										borderRadius: '3px 0 0 3px'
									}}
								/>
								<div style={{ position: 'absolute', left: '-100vw' }} aria-hidden="true">
									<input
										type="text"
										name="b_8f07560758ff52583a4f34f45_d598cf405b"
										tabIndex={-1}
										value=""
										readOnly
									/>
								</div>
								<input
									type="submit"
									value="Subscribe"
									name="subscribe"
									id="mc-embedded-subscribe"
									style={{
										fontFamily: 'Graphik, Arial',
										fontSize: '16px',
										border: 'none',
										padding: '0 15px',
										background: D.Color.Violet,
										color: D.Color.White,
										borderRadius: '0 3px 3px 0',
										WebkitAppearance: 'none'
									}}
								/>
							</div>
						</form>
					</div>
				</D.Layout>
			</D.Section>

			<D.Section backgroundColor={D.Color.Grey95}>
				<D.Headline
					level={D.HeadlineLevel.H1}
					color={D.Color.Violet}
					fontWeight={D.FontWeight.Light}
				>
					<b>And wait for it</b> – we are entirely open source.
				</D.Headline>
				<D.Space size={D.SpaceSize.M} />
				<D.Layout maxWidth="640px">
					<D.Copy size={D.CopySize.Large} color={D.Color.Grey50}>
						For the last years most of the design tools have been expensive and proprietary
						software. We want to give something back to the community and start the next
						generation of design tools. Open-minded and open-source.
					</D.Copy>
				</D.Layout>
				<D.Space size={D.SpaceSize.L} />
				<a href="https://github.com/meetalva/alva/" target="_blank" rel="noopener">
					<D.Button order={D.ButtonOrder.Secondary} color={D.Color.Violet}>
						Contribute to Alva on Github
					</D.Button>
				</a>
				<D.Space size={D.SpaceSize.S} />
				<a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fmeetalva.io%2F&via=meetalva&text=Create%20living%20prototypes%20with%20code%20components.%20&hashtags=react%2C%20prototype">
					<D.Button order={D.ButtonOrder.Secondary} color={D.Color.Violet}>
						Tweet about us
					</D.Button>
				</a>
			</D.Section>

			<D.Section backgroundColor={D.Color.Violet}>
				<D.Headline
					level={D.HeadlineLevel.H2}
					color={D.Color.White}
					fontWeight={D.FontWeight.Light}
				>
					Getting Started
				</D.Headline>
				<D.Space size={D.SpaceSize.M} />
				<D.Layout maxWidth="640px">
					<D.Copy size={D.CopySize.Large} color={D.Color.White}>
						You're new to Alva? Follow our easy-to-learn guides and shape a new era of product
						design.
					</D.Copy>
				</D.Layout>
				<D.Space size={D.SpaceSize.M} />
				<a href="./doc/docs/start" target="_blank" rel="noopener">
					<D.Button order={D.ButtonOrder.Secondary} color={D.Color.White}>
						Find our Guides
					</D.Button>
				</a>
			</D.Section>

			<D.Footer copyright="&copy; 2018 Alva">
				<D.MenuItem linkName="hey@meetalva.io" rel="noopener" href="mailto:hey@meetalva.io" />
				<D.MenuItem
					linkName="Proudly powered by SinnerSchrader"
					target="_blank"
					rel="noopener"
					href="https://sinnerschrader.com"
				/>
				<D.MenuItem
					linkName="Legal notice"
					target="_blank"
					rel="noopener"
					href="./doc/docs/legalnotice"
				/>
				<D.MenuItem
					linkName="Privacy Policy"
					target="_blank"
					rel="noopener"
					href="./doc/docs/privacypolicy?guides-enabled=true"
				/>
			</D.Footer>
		</div>
	);
};

export default Page;
