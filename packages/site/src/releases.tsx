import * as React from 'react';
import data from './releases-data';
import * as Path from 'path';
import * as D from '@meetalva/designkit';

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

		return (
			<div>
				<div style={{ display: 'flex' }}>
					<a href={stableLink.link} target="_blank" rel="noopener">
						<D.Button order={D.ButtonOrder.Primary}>
							Get Alva {this.state.os !== Os.Unknown ? `for` : '   '} {this.state.os}
						</D.Button>
					</a>
					<D.Space size={D.SpaceSize.XS} />
					<a href={alphaLink.link} target="_blank" rel="noopener">
						<D.Button order={D.ButtonOrder.Secondary}>Get Alva Canary</D.Button>
					</a>
				</div>
				<D.Space size={D.SpaceSize.S} />
				<D.Copy color={D.Color.Grey70} size={D.CopySize.Small}>
					Also available for{' '}
					{stableLinks.map((link, i) => (
						<React.Fragment key={link.os}>
							<a href={link.link} target="_blank" style={{ color: D.Color.White }}>
								{link.os}
							</a>
							{getSeperator(stableLinks.length, i)}
						</React.Fragment>
					))}.
				</D.Copy>
				<D.Copy color={D.Color.Grey70} size={D.CopySize.Small}>
					Check all{' '}
					<a
						href={stable ? stable.html_url : ''}
						target="_blank"
						style={{ color: D.Color.White }}
					>
						supported platforms
					</a>
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
