import * as React from 'react';
import { Helmet } from 'react-helmet';
import * as D from './components';
import { Hero } from './hero';

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

			<Hero />

			<D.Section backgroundColor={D.Color.White} textColor={D.Color.Black}>
				<D.Headline level={D.HeadlineLevel.H3}>
					1. Design System, Code compontents, SSOT -> Alva
				</D.Headline>
				<D.Headline level={D.HeadlineLevel.H3}>
					2. Use those components to compose new designs + responsive
				</D.Headline>
				<D.Headline level={D.HeadlineLevel.H3}>
					3. Crazy shit -> Data / Interactivity / logic
				</D.Headline>
			</D.Section>

			<D.Space size={D.SpaceSize.XL} />
			<D.Section backgroundColor={D.Color.Grey95}>
				<D.Headline
					level={D.HeadlineLevel.H1}
					color={D.Color.Violet}
					fontWeight={D.FontWeight.Light}
				>
					Open-minded and <b>open source</b>.
				</D.Headline>
				<D.Space size={D.SpaceSize.M} />
				<D.Layout maxWidth="640px">
					<D.Copy size={D.CopySize.Large} color={D.Color.Grey50}>
						Over the years, most design tools have been expensive and proprietary software.
						Focusing heavily on visual design and ignoring the importance of cross-functional
						co-creation.
						<br />
						<br />
						Join us and let's invent the next generation of design tools together.
					</D.Copy>
				</D.Layout>
				<D.Space size={D.SpaceSize.L} />
				<a href="https://github.com/meetalva/alva/" target="_blank" rel="noopener">
					<D.Button order={D.ButtonOrder.Secondary} color={D.Color.Violet}>
						Contribute on Github
					</D.Button>
				</a>
				<D.Space size={D.SpaceSize.S} />
				<a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fmeetalva.io%2F&via=meetalva&text=Create%20living%20prototypes%20with%20code%20components.%20&hashtags=react%2C%20prototype">
					<D.Button order={D.ButtonOrder.Secondary} color={D.Color.Violet}>
						Tweet about us
					</D.Button>
				</a>
			</D.Section>

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

			<D.Footer copyright="&copy; 2018 Alva">
				<D.MenuItem rel="noopener" href="mailto:hey@meetalva.io">
					Write us
				</D.MenuItem>
				<D.MenuItem
					target="_blank"
					rel="noopener"
					href="https://twitter.com/meetalva"
					title="Find us on Twitter"
				>
					Follow us
				</D.MenuItem>
				<D.MenuItem target="_blank" rel="noopener" href="https://sinnerschrader.com">
					Proudly powered by SinnerSchrader
				</D.MenuItem>
				<D.MenuItem
					target="_blank"
					rel="noopener"
					href="./doc/docs/legalnotice?guides-enabled=true"
				>
					Legal notice
				</D.MenuItem>
				<D.MenuItem
					target="_blank"
					rel="noopener"
					href="./doc/docs/privacypolicy?guides-enabled=true"
				>
					Privacy Policy
				</D.MenuItem>
			</D.Footer>
		</div>
	);
};

export default Page;
