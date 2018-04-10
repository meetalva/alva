import { PreviewTile } from '../../lsg/patterns/preview-tile/index';
import Space, { Size } from '../../lsg/patterns/space/index';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/page/page-ref';
import * as React from 'react';
import { Store } from '../../store/store';

export interface PageTileContainerProps {
	focused: boolean;
	onClick: React.MouseEventHandler<HTMLElement>;
	page: PageRef;
}

@observer
export class PageTileContainer extends React.Component<PageTileContainerProps> {
	@MobX.observable public editable: boolean = false;
	@MobX.observable public inputValue: string = '';
	@MobX.observable public namedPage: boolean = Boolean(this.props.page.getName());

	public constructor(props: PageTileContainerProps) {
		super(props);
		this.inputValue = this.inputValue || (this.props.page.getName() || 'Unnamed Page');
		console.log(this.namedPage, '((((((');
		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.renamePage = this.renamePage.bind(this);
	}

	@MobX.action
	protected handleBlur(): void {
		this.renamePage();
	}

	@MobX.action
	protected handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.inputValue = e.target.value;
	}

	@MobX.action
	protected handleClick(e: React.MouseEvent<HTMLElement>): void {
		this.props.onClick(e);
		if (this.props.focused) {
			this.editable = true;
		}
	}

	protected handleDoubleClick(e: React.MouseEvent<HTMLElement>): void {
		Store.getInstance().openPage(this.props.page.getId());
	}

	@MobX.action
	protected handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
		switch (e.key) {
			case 'Escape':
				this.inputValue = this.props.page.getName();
				this.editable = false;
				break;

			case 'Enter':
				this.renamePage();
				break;

			default:
				return;
		}
	}
	@MobX.action
	protected renamePage(): void {
		if (!this.inputValue) {
			this.inputValue = this.props.page.getName();
			this.editable = false;
			return;
		}

		this.props.page.setName(this.inputValue);
		Store.getInstance().save();
		this.editable = false;
	}

	public render(): JSX.Element {
		return (
			<Space size={Size.S}>
				<PreviewTile
					editable={this.editable}
					focused={this.props.focused}
					id={this.props.page.getId()}
					name={this.inputValue}
					onBlur={this.handleBlur}
					onChange={this.handleChange}
					onClick={this.handleClick}
					onDoubleClick={this.handleDoubleClick}
					onKeyDown={this.handleKeyDown}
					named={this.namedPage}
					value={this.inputValue}
				/>
			</Space>
		);
	}
}
