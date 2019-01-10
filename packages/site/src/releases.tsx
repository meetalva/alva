import * as React from 'react';
import * as Path from 'path';
import * as D from '@meetalva/designkit';
import styled from '@emotion/styled';
import data from './releases-data';

enum Os {
	macOS = 'macOS  ',
	Windows = 'Windows',
	Linux = 'Linux  ',
	Unknown = '       '
}

enum Extension {
	exe = 'exe',
	dmg = 'dmg',
	appimage = 'AppImage',
	Unknown = 'Unknown'
}

const StyledLink =
	styled.a <
	{ white: boolean } >
	`
	cursor: pointer;
	color: ${props => (props.white ? D.Color.White : 'inherit')};
`;

const Link: React.SFC<{ href: string; white: boolean }> = props => {
	return (
		<StyledLink href={props.href} target="_blank" rel="noopener" white={props.white}>
			{props.children}
		</StyledLink>
	);
};

export class Releases extends React.Component {
	public state = {
		os: Os.Unknown
	};

	public componentDidMount() {
		this.setState({ os: getOS() });
	}

	public render() {
		const releases = (data.releases || []).filter(r => !r.draft);
		const alphaReleases = (data.canary || [])
			.map((id: any) => releases.find((r: any) => r.id === id))
			.filter(Boolean);
		const stableReleases = (data.stable || [])
			.map((id: any) => releases.find((r: any) => r.id === id))
			.filter(Boolean);

		const alpha = alphaReleases[0];
		const stable = stableReleases[0];

		const stableLink = getReleaseLink(stable, this.state.os);
		const alphaLink = getReleaseLink(alpha, this.state.os);

		const stableLinks = [
			getReleaseLink(stable, Os.macOS),
			getReleaseLink(stable, Os.Windows),
			getReleaseLink(stable, Os.Linux)
		].filter(l => l.os !== stableLink.os);

		console.log({
			releases: releases.map(r => r.tag_name),
			alphaReleases: alphaReleases.map(a => a!.tag_name),
			stableReleases: stableReleases.map(s => s!.tag_name)
		});

		return (
			<div>
				<div style={{ display: 'flex' }}>
					<Link href={stableLink.link} white={false}>
						<D.Button order={D.ButtonOrder.Primary}>
							Get Alva {this.state.os !== Os.Unknown ? `for` : '   '} {this.state.os}
						</D.Button>
					</Link>
					<D.Space size={D.SpaceSize.XS} />
					<Link href={alphaLink.link} white={false}>
						<D.Button order={D.ButtonOrder.Secondary}>Get Alva Canary</D.Button>
					</Link>
				</div>
				<D.Space size={D.SpaceSize.S} />
				<D.Copy color={D.Color.Grey70} size={D.CopySize.Small}>
					Also available for{' '}
					{stableLinks.map((link, i) => (
						<React.Fragment key={link.os}>
							<Link href={link.link} white>
								{link.os}
							</Link>
							{getSeperator(stableLinks.length, i)}
						</React.Fragment>
					))}.
				</D.Copy>
				<D.Copy color={D.Color.Grey70} size={D.CopySize.Small}>
					Check all{' '}
					<Link href={stable ? stable.html_url : ''} white>
						supported platforms
					</Link>
					.
				</D.Copy>
			</div>
		);
	}
}

function getSeperator(length: number, index: number): string {
	if (index >= length - 1) {
		return '';
	}

	return index === length - 2 ? ' and ' : ', ';
}

function getReleaseLink(release: any, os: Os): { os: Os; link: string } {
	if (!release) {
		return { os, link: `https://github.com/meetalva/alva/releases/` };
	}

	const asset = release.assets.find(
		(a: any) => Path.extname(a.name).slice(1) === getFileExtension(os)
	);

	if (release && !asset) {
		return { os, link: release.html_url };
	}

	return { os, link: asset ? asset.browser_download_url : release.html_url };
}

function getOS(): Os {
	if (typeof window === 'undefined') {
		return Os.Unknown;
	}
	switch (navigator.platform.split(' ')[0]) {
		case 'MacIntel':
			return Os.macOS;
		case 'Win32':
		case 'Win64':
			return Os.Windows;
		case 'Linux':
			return Os.Linux;
		default:
			return Os.Unknown;
	}
}

function getFileExtension(os: Os): Extension {
	switch (os) {
		case Os.macOS:
			return Extension.dmg;
		case Os.Windows:
			return Extension.exe;
		case Os.Linux:
			return Extension.appimage;
		case Os.Unknown:
			return Extension.Unknown;
	}
}
