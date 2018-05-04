import { PreviewTile } from '../../lsg/patterns/preview-tile/index';
import Space, { SpaceSize } from '../../lsg/patterns/space/index';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/page/page-ref';
import * as React from 'react';
import { Store } from '../../store/store';

export interface PageTileContainerProps {
	focused: boolean;
	page: PageRef;
}

@observer
export class PageTileContainer extends React.Component<PageTileContainerProps> {
	@MobX.observable public editable: boolean = false;
	@MobX.observable public editing: boolean = false;
	@MobX.observable public inputValue: string = '';

	@MobX.computed
	public get namedPage(): boolean {
		return Boolean(this.props.page.getName());
	}

	@MobX.action
	protected handleBlur(): void {
		this.editing = false;

		if (!this.inputValue) {
			this.inputValue = this.props.page.getName();
			this.editable = false;
			return;
		}

		this.props.page.setName(this.inputValue);
		Store.getInstance().save();
		this.editable = false;
	}

	@MobX.action
	protected handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.inputValue = e.target.value;
	}

	@MobX.action
	protected handleClick(e: React.MouseEvent<HTMLElement>): void {
		const store = Store.getInstance();
		store.openPage(this.props.page.getId());

		const target = e.target as HTMLElement;

		if (this.props.focused && target.matches('[data-title]')) {
			this.inputValue = this.props.page.getName();
			this.editable = true;
		}
	}

	@MobX.action
	protected handleDoubleClick(e: React.MouseEvent<HTMLElement>): void {
		if (this.editing) {
			return;
		}

		const store = Store.getInstance();
		store.togglePageOverview();
		store.openPage(this.props.page.getId());
	}

	@MobX.action
	protected handleFocus(): void {
		setTimeout(() => {
			this.editing = true;
		}, 300);
	}

	@MobX.action
	protected handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
		switch (e.key) {
			case 'Escape':
				this.inputValue = this.props.page.getName();
				this.editable = false;
				break;

			case 'Enter':
				if (!this.inputValue) {
					this.inputValue = this.props.page.getName();
					this.editable = false;
					return;
				}

				this.props.page.setName(this.inputValue);
				Store.getInstance().save();
				this.editable = false;
				break;

			default:
				return;
		}
	}

	public render(): JSX.Element {
		return (
			<Space size={SpaceSize.S}>
				<PreviewTile
					editable={this.editable}
					focused={this.props.focused}
					id={this.props.page.getId()}
					onBlur={e => this.handleBlur()}
					onChange={e => this.handleChange(e)}
					onClick={e => this.handleClick(e)}
					onDoubleClick={e => this.handleDoubleClick(e)}
					onFocus={e => this.handleFocus()}
					onKeyDown={e => this.handleKeyDown(e)}
					named={this.namedPage}
					value={this.editable ? this.inputValue : this.props.page.getName()}
				/>
			</Space>
		);
	}
}
