import * as C from '@meetalva/components';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';
import { WithStore } from '../store';
import { LibraryStoreItemContainer, LibraryStoreItemState, LibraryStoreItemSize } from './library-store-item-container';
import { MessageType } from '@meetalva/message';
import * as uuid from 'uuid';
import { ExternalLink, ChevronDown, WifiOff } from 'react-feather';
import * as T from '@meetalva/types';
import { MessageType as MT } from '@meetalva/message';
import { PatternLibraryInstallType } from '@meetalva/types';
import { When } from './when';
import { animateScroll } from 'react-scroll';

const validatePackageName = require('validate-npm-package-name');


const Details = styled.details<{ mayToggle: boolean; }>`
	${props => props.mayToggle ? '' : 'appearance: none;'}
	max-height: 40px;
	transition: max-height 120ms ease-out;
	will-change: height;

	&[open] {
		max-height: 520px;
	}
`;

const DetailsSummary = styled.summary`
	outline: none;

	&::-webkit-details-marker {
		display: none;
	}
	&::-moz-list-bullet {
		list-style-type: none;
		display: block;
	}
`;

@MobxReact.inject('store')
@MobxReact.observer
export class LibraryStoreContainer extends React.Component {
	@Mobx.observable private online: boolean = navigator.onLine;
	@Mobx.observable private searchValue: string = '';
	@Mobx.observable private submittedValue: string = '';
	@Mobx.observable private isValidPackage: boolean = false;
	@Mobx.observable private itemState: LibraryStoreItemState = LibraryStoreItemState.Default;

	@Mobx.computed
	private get isValidName() {
		const fragments = this.searchValue.split('@');
		const name = (fragments.length >= 3 ? fragments.slice(0, -1) : fragments).join('@');
		const validation = validatePackageName(name);

		if (!validation.validForOldPackages) {
			return false;
		}

		return true;
	}

	private checkPackage = async (raw: string) => {
		const fragments = raw.split('@');
		const name = (fragments.length >= 3 ? fragments.slice(0, -1) : fragments).join('@');
		const response = await fetch(`https://registry.npmjs.cf/${name}`, { method: 'HEAD' });

		if (raw === this.searchValue) {
			this.isValidPackage = response.ok;
		}
	};

	private handleDetailsClick: React.MouseEventHandler<HTMLDetailsElement> = e => {
		e.preventDefault();
		const { store } = this.props as WithStore;
		const libraryStore = store.libraryStore;
		libraryStore.installedOpen = !libraryStore.installedOpen;
	};

	private handleLocalInstallClick: React.MouseEventHandler<HTMLElement> = e => {
		e.preventDefault();
		e.stopPropagation();

		const { store } = this.props as WithStore;
		const app = store.getApp();

		app.send({
			type: MessageType.ConnectPatternLibraryRequest,
			id: uuid.v4(),
			payload: {
				library: undefined,
				projectId: store.getProject().getId()
			}
		})
	}

	public componentDidMount() {
		const { store } = this.props as WithStore;
		const app = store.getApp();

		Mobx.autorun(async () => {
			this.isValidPackage = false;
			this.submittedValue = '';
			this.online = navigator.onLine;

			if (!this.isValidName) {
				return;
			}

			const searchValue = this.searchValue;
			this.checkPackage(searchValue);
		});

		Mobx.autorun(async () => {
			if (this.submittedValue && this.isValidPackage) {
				const fragments = this.submittedValue.split('@');
				const name = (fragments.length >= 3 ? fragments.slice(0, -1) : fragments).join('@');
				const existing = store.libraryStore.getItemByPackageName(name);

				this.itemState = LibraryStoreItemState.Progress;

				if (existing) {
					await existing.connect(store.getApp(), {
						npmId: this.submittedValue,
						project: store.getProject(),
						installType: PatternLibraryInstallType.Remote
					});
				} else {
					await app.transaction({
						id: uuid.v4(),
						type: MT.ConnectNpmPatternLibraryRequest,
						payload: {
							npmId: this.submittedValue,
							projectId: store.getProject().getId()
						}
					}, { type: MT.ConnectPatternLibraryResponse })

				}

				this.itemState = LibraryStoreItemState.Done;
				this.submittedValue = '';

				store.libraryStore.installedOpen = true;
				animateScroll.scrollToTop({
					duration: 200,
					delay: 500,
					containerId: 'store'
				})
			}
		});
	}

	public render(): JSX.Element | null {
		const { store } = this.props as WithStore;
		const app = store.getApp();
		const isValidPackage = this.isValidPackage;
		const libraryStore = store.libraryStore;

		const buttonState = () => {
			switch (this.itemState) {
				case LibraryStoreItemState.Progress:
					return C.ButtonState.Progress
				case LibraryStoreItemState.Done:
					return C.ButtonState.Done
				case LibraryStoreItemState.Default:
				default:
					return C.ButtonState.Default
			}
		}


		return (
			<div id="store" style={{
				overflow: 'scroll',
				userSelect: 'none',
				height: '100%',
				background: C.Color.White
			}}>
				<div style={{ background: C.Color.Grey97 }}>
					<div
						style={{
							width: '90%',
							maxWidth: '1080px',
							margin: '0 auto',
							padding: `${C.getSpace(C.SpaceSize.L)}px 0`,
						}}
					>
						<Details mayToggle={libraryStore.updateCount === 0} open={libraryStore.installedOpen}>
							<DetailsSummary onClick={this.handleDetailsClick}>
								<C.Space size={C.SpaceSize.XS}>
									<C.Flex
										alignItems={C.FlexAlignItems.Center}
										justifyContent={C.FlexJustifyContent.SpaceBetween}
									>
										<C.Flex>
											<div>
												<C.Space sizeTop={2} />
												<C.BadgeIcon
													color={libraryStore.updateAvailable ? C.Color.Orange : C.Color.Green}
												>
													{libraryStore.updateCount > 0 ? libraryStore.updateCount : ''}
												</C.BadgeIcon>
											</div>
											<C.Space sizeRight={C.SpaceSize.XS + C.SpaceSize.XXS} />
											<div>
												<C.Headline
													order={4}
													bold
													textColor={libraryStore.updateAvailable ? C.Color.Orange : C.Color.Green}
												>
													{libraryStore.updateAvailable
														? 'Updates available'
														: 'Everything up to date'}
												</C.Headline>
												<C.Space sizeBottom={C.SpaceSize.XS} />
												<When mayToggle={libraryStore.updateCount === 0}>
													<C.Flex style={{ alignItems: 'center' }}>
														<C.Copy textColor={C.Color.Grey36}>
															Show {libraryStore.withLibrary.length} installed{' '}
															{libraryStore.withLibrary.length === 1
																? 'library'
																: 'libraries'}
														</C.Copy>
														<C.Space sizeRight={C.SpaceSize.XXS} />
														<ChevronDown color={C.Color.Grey36} size={C.IconSize.XS} />
													</C.Flex>
												</When>
											</div>
										</C.Flex>
										{store.getApp().isHostType(T.HostType.Electron) && (
											<C.Button
												order={C.ButtonOrder.Secondary}
												size={C.ButtonSize.Medium}
												onClick={this.handleLocalInstallClick}
											>
												Install Local Library
											</C.Button>
										)}
									</C.Flex>
								</C.Space>
							</DetailsSummary>
							<C.Space sizeBottom={C.SpaceSize.XS} />
							<C.Flex
								style={{
									flexWrap: 'wrap'
								}}
							>
								{(libraryStore.updateCount === 0 ? libraryStore.withLibrary : libraryStore.withUpdate).map(item => (
									<LibraryStoreItemContainer
										key={item.id}
										item={item}
										size={LibraryStoreItemSize.Medium}
									/>
								))}
							</C.Flex>
							{this.online && (
								<C.Space size={C.SpaceSize.XS}>
									<C.LinkIcon
										color={C.Color.Grey50}
										icon="RotateCw"
										size={C.CopySize.S}
										onClick={() => libraryStore.checkForUpdates()}
									>
										Check for Updates
									</C.LinkIcon>
								</C.Space>
							)}
							<C.Space sizeBottom={C.SpaceSize.XS} />
						</Details>
					</div>
				</div>

				<div
					style={{
						background: C.Color.White,
						borderTop: `1px solid ${C.Color.Grey90}`
					}}
				>
					<div
						style={{
							width: '90%',
							maxWidth: '1080px',
							margin: '0 auto',
							padding: `${C.getSpace(C.SpaceSize.XXXL + C.SpaceSize.L)}px 0`
						}}
					>
						{this.online ? (
							<>
								<C.Space size={C.SpaceSize.XS}>
									<div style={{ maxWidth: '260px' }}>
										<C.Headline order={2} bold textColor={C.Color.Grey10}>
											Library Store
										</C.Headline>
										<C.Space sizeBottom={C.SpaceSize.M} />
										<C.Copy textColor={C.Color.Grey36} size={C.CopySize.M}>
											Browse and install compatible code libraries for your prototype
										</C.Copy>
									</div>
								</C.Space>

								<C.Space sizeBottom={C.SpaceSize.XXL} />
								<C.Flex>
									{libraryStore.recommendations.map(item => (
										<LibraryStoreItemContainer
											key={item.id}
											item={item}
											size={LibraryStoreItemSize.Large}
										/>
									))}
								</C.Flex>
							</>
						) : (
							<C.Space size={C.SpaceSize.XS}>
								<div style={{
									maxWidth: '240px',
									padding: `${C.SpaceSize.XXXL*2}px 0`,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									margin: '0 auto',
									textAlign: 'center'
								}}>
									<WifiOff color={C.Color.Grey60} />
									<C.Space sizeBottom={C.SpaceSize.M} />
									<C.Headline order={3} textColor={C.Color.Grey60}>
										No Internet
									</C.Headline>
									<C.Space sizeBottom={C.SpaceSize.XS} />
									<C.Copy textColor={C.Color.Grey60} size={C.CopySize.M}>
										Make sure to be online for exploring the library store.
									</C.Copy>
									<C.Space sizeBottom={C.SpaceSize.XXL} />
									<C.Button order={C.ButtonOrder.Secondary} size={C.ButtonSize.Medium} onClick={() => this.online = navigator.onLine}>Try again</C.Button>
									<C.Space sizeBottom={C.SpaceSize.XXL} />
								</div>
							</C.Space>
						)}
						<C.Space sizeTop={C.SpaceSize.XXXL} />
						{(store.getApp().isHostType(T.HostType.Electron) || this.online) && (
							<C.Space size={C.SpaceSize.XS}>
								<div
									style={{
										width: '100%',
										height: '.5px',
										background: C.Color.Grey90
									}}
								/>
							</C.Space>
						)}
						<C.Space sizeTop={C.SpaceSize.XXXL} />

						<C.Flex>
							{this.online && (
								<div style={{ width: '50%', flexShrink: 0 }}>
									<C.Space size={C.SpaceSize.XS}>
										<div style={{ maxWidth: '360px' }}>
											<C.Headline order={4} bold textColor={C.Color.Grey10}>
												Install Library from NPM
													</C.Headline>
											<C.Space sizeBottom={C.SpaceSize.XS} />
											<C.Copy textColor={C.Color.Grey36} size={C.CopySize.M}>
												Install any package with a React and TypeScript library from NPM.
													</C.Copy>
											<C.Space sizeBottom={C.SpaceSize.M} />
											<C.InputButton
												placeholder="Package Name"
												value={this.searchValue}
												isValid={() => isValidPackage}
												state={buttonState()}
												disabled={this.itemState === LibraryStoreItemState.Progress}
												onSubmit={e => {
													e.preventDefault();
													if (this.itemState !== LibraryStoreItemState.Progress) {
														this.submittedValue = this.searchValue;
													}
												}}
												onChange={e => {
													this.searchValue = e.target.value;
													this.itemState = LibraryStoreItemState.Default;
												}}
											>
												Install
													</C.InputButton>
										</div>
									</C.Space>
								</div>
							)}
							{store.getApp().isHostType(T.HostType.Electron) && (
								<div style={{ width: '50%', flexShrink: 0 }}>
									<C.Space size={C.SpaceSize.XS}>
										<div style={{ maxWidth: '360px' }}>
											<C.Headline order={4} bold textColor={C.Color.Grey10}>
												Install Local Library
												</C.Headline>
											<C.Space sizeBottom={C.SpaceSize.XS} />
											<C.Copy textColor={C.Color.Grey36} size={C.CopySize.M}>
												Select a library running on your local computer. Build it and
												select the package.json in the library folder.
												</C.Copy>
											<C.Space sizeBottom={C.SpaceSize.M} />
											<C.Button
												order={C.ButtonOrder.Primary}
												size={C.ButtonSize.Medium}
												onClick={() =>
													app.send({
														id: uuid.v4(),
														payload: {
															library: undefined,
															projectId: store.getProject().getId()
														},
														type: MessageType.ConnectPatternLibraryRequest
													})
												}
											>
												Install Local Library
												</C.Button>
											<C.Space sizeBottom={C.SpaceSize.S} />
											<C.Link
												color={C.Color.Grey50}
												onClick={() => {
													store.getSender().send({
														type: MessageType.OpenExternalURL,
														id: uuid.v4(),
														payload:
															'https://meetalva.io/doc/docs/guides/library.html'
													});
												}}
											>
												<div style={{ display: 'flex', alignItems: 'center' }}>
													<ExternalLink size={C.IconSize.XS} strokeWidth={1.5} />
													<C.Space sizeRight={C.SpaceSize.XXS} />
													See Guide
													</div>
											</C.Link>
											<C.Space sizeTop={C.SpaceSize.XXL} />
										</div>
									</C.Space>
								</div>
							)}
						</C.Flex>
						<C.Space sizeTop={C.SpaceSize.XXXL} />
					</div>
				</div>
			</div>
		);
	}
}
