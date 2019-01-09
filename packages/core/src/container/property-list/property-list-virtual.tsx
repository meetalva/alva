import * as Mobx from 'mobx';
import { partition, groupBy, entries } from 'lodash';
import * as React from 'react';
import { AutoSizer, CellMeasurerCache, List, ListRowProps } from 'react-virtualized';
import styled from 'styled-components';
import * as Types from '../../types';
import * as Model from '../../model';
import { Row, RowType, CardRow, GroupRow, PropertyRow } from './property-row';
import * as Components from '../../components';

export interface PropertyListVirtualProps {
	element: Model.Element;
}

const ListWrapper = styled.div`
	.ReactVirtualized__Grid__innerScrollContainer {
		overflow: visible !important;
	}
`;

export class PropertyListVirtual extends React.Component<PropertyListVirtualProps> {
	@Mobx.observable private codeDetails = false;

	// tslint:disable-next-line:no-empty
	private list = React.createRef<List>();

	public componentWillReceiveProps(nextProps: PropertyListVirtualProps) {
		if (nextProps.element.getId() !== this.props.element.getId()) {
			this.cache.clearAll();

			if (this.list.current && this.list.current.Grid) {
				this.list.current.Grid.forceUpdate();
			}
		}
	}

	@Mobx.action
	private toggleCodeDetails = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		this.codeDetails = !this.codeDetails;
	};

	private handleMeasure = (item: ListRowProps) => {
		this.cache.clear(item.index, 0);

		if (item.parent.recomputeGridSize) {
			item.parent.recomputeGridSize({ rowIndex: item.index, columnIndex: 0 });
		}
	};

	private cache = new CellMeasurerCache({ fixedWidth: true });

	public render() {
		const props = this.props;
		const relevantProps = props.element.getProperties().filter(p => !p.getHidden());

		const [eventHandlerProps, elementProps] = partition(
			relevantProps,
			isPropertyType(Types.PatternPropertyType.EventHandler)
		);

		const [unknownProps, regularProps] = partition(
			elementProps,
			isPropertyType(Types.PatternPropertyType.Unknown)
		);

		const [groupedProps, ungroupedProps] = partition(regularProps, isGrouped(true));

		const groupedPropsObject = groupBy(groupedProps, elementProperty =>
			elementProperty.getGroup()
		);

		const rows: Row[] = [
			...ungroupedProps.map((prop): PropertyRow => ({ prop, type: RowType.Property })),
			...entries(groupedPropsObject).map(([name, items]): GroupRow => ({
				group: { name, items },
				type: RowType.PropertyGroup
			})),
			...eventHandlerProps.map((prop): CardRow => ({ prop, type: RowType.Card })),
			{
				props: unknownProps,
				type: RowType.Details
			}
		];

		return (
			<AutoSizer>
				{autoSizer => (
					<ListWrapper>
						<List
							ref={this.list}
							height={autoSizer.height}
							width={autoSizer.width}
							deferredMeasurementCache={this.cache}
							style={{
								outline: 'none',
								padding: Components.getSpace(Components.SpaceSize.M)
							}}
							rowRenderer={item => {
								const row = rows[item.index];
								if (!row) {
									return null;
								}
								return (
									<PropertyRow
										key={item.key}
										row={row}
										cache={this.cache}
										item={item}
										detailsOpen={this.codeDetails}
										onCodeDetailsClick={this.toggleCodeDetails}
										onMeasure={this.handleMeasure}
									/>
								);
							}}
							rowCount={rows.length}
							rowHeight={this.cache.rowHeight}
						/>
					</ListWrapper>
				)}
			</AutoSizer>
		);
	}
}

function isPropertyType(type: Types.PatternPropertyType): (p: Model.ElementProperty) => boolean {
	return p => {
		const patternProperty = p.getPatternProperty();
		return typeof patternProperty !== 'undefined' && patternProperty.getType() === type;
	};
}

function isGrouped(grouped: boolean): (p: Model.ElementProperty) => boolean {
	return p => {
		const patternProperty = p.getPatternProperty();
		const hasGroup = typeof patternProperty !== 'undefined' && patternProperty.getGroup() !== '';
		return typeof patternProperty !== 'undefined' && hasGroup === grouped;
	};
}
