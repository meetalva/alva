import { PropertyListItem } from './property-list-item';
import * as React from 'react';
import { CellMeasurer, CellMeasurerCache, List, ListRowProps } from 'react-virtualized';
import * as Model from '../../model';
import * as Components from '@meetalva/components';

export enum RowType {
	Property,
	PropertyGroup,
	Card,
	Details
}

export type Row = PropertyRow | GroupRow | CardRow | DetailsRow;

export interface PropertyRow {
	type: RowType.Property;
	prop: Model.ElementProperty;
}

export interface GroupRow {
	type: RowType.PropertyGroup;
	group: { name: string; items: Model.ElementProperty[] };
}

export interface CardRow {
	type: RowType.Card;
	prop: Model.ElementProperty;
}

export interface DetailsRow {
	type: RowType.Details;
	props: Model.ElementProperty[];
}

export interface PropertyRowProps {
	cache: CellMeasurerCache;
	row: Row;
	detailsOpen: boolean;
	item: ListRowProps;
	onMeasure?(item: ListRowProps): void;
	onCodeDetailsClick?: React.MouseEventHandler<HTMLElement>;
}

export const PropertyRow: React.SFC<PropertyRowProps> = props => (
	<CellMeasurer
		cache={props.cache}
		columnIndex={0}
		key={props.item.key}
		parent={props.item.parent}
		rowIndex={props.item.index}
		width={props.item.style.width}
	>
		<div style={{ ...props.item.style, overflow: 'visible' }}>
			{props.row.type === RowType.Property && (
				<PropertyListItem
					key={props.row.prop.getId()}
					property={props.row.prop}
					onDidRender={() => props.onMeasure && props.onMeasure(props.item)}
				/>
			)}

			{props.row.type === RowType.PropertyGroup &&
				(props.row.group.items.length > 0 && (
					<Components.PropertyDetails
						open
						onClick={e => e.preventDefault()}
						key={props.row.group.name}
						summary={
							<Components.Headline order={4}>{props.row.group.name}</Components.Headline>
						}
					>
						{props.row.group.items.map(property => (
							<PropertyListItem
								key={property.getId()}
								property={property}
								onDidRender={() => props.onMeasure && props.onMeasure(props.item)}
							/>
						))}
					</Components.PropertyDetails>
				))}

			{props.row.type === RowType.Card && (
				<PropertyListItem
					key={props.row.prop.getId()}
					property={props.row.prop}
					onDidRender={() => props.onMeasure && props.onMeasure(props.item)}
				/>
			)}

			{props.row.type === RowType.Details &&
				props.row.props.length > 0 && (
					<Components.PropertyDetails
						open={props.detailsOpen}
						onClick={e => {
							if (props.onCodeDetailsClick) {
								props.onCodeDetailsClick(e);
							}

							if (props.onMeasure) {
								props.onMeasure(props.item);
							}
						}}
						toggleable
						summary={
							<div>
								<Components.Headline order={4}>Code Properties</Components.Headline>
								<Components.Space sizeBottom={Components.SpaceSize.XS} />
								<Components.Copy>This component accepts code properties</Components.Copy>
							</div>
						}
					>
						{props.row.props.map(elementProperty => (
							<PropertyListItem
								key={elementProperty.getId()}
								property={elementProperty}
								onDidRender={() => props.onMeasure && props.onMeasure(props.item)}
							/>
						))}
					</Components.PropertyDetails>
				)}
		</div>
	</CellMeasurer>
);
