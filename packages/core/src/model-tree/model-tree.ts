import * as Model from '../model';
import * as Types from '../types';

export function getModelByName(modelName?: Types.ModelName): Types.ModelSurface | undefined {
	switch (modelName) {
		case Types.ModelName.AlvaApp:
			return Model.AlvaApp;
		case Types.ModelName.Element:
			return Model.Element;
		case Types.ModelName.ElementAction:
			return Model.ElementAction;
		case Types.ModelName.ElementContent:
			return Model.ElementContent;
		case Types.ModelName.Page:
			return Model.Page;
		case Types.ModelName.Pattern:
			return Model.Pattern;
		case Types.ModelName.PatternLibrary:
			return Model.PatternLibrary;
		case Types.ModelName.PatternProperty:
			return Model.PatternProperty;
		case Types.ModelName.PatternEnumPropertyOption:
			return Model.PatternEnumPropertyOption;
		case Types.ModelName.PatternSlot:
			return Model.PatternSlot;
		case Types.ModelName.UserStore:
			return Model.UserStore;
		case Types.ModelName.UserStoreAction:
			return Model.UserStoreAction;
		case Types.ModelName.UserStoreEnhancer:
			return Model.UserStoreEnhancer;
		case Types.ModelName.UserStoreProperty:
			return Model.UserStoreProperty;
		case Types.ModelName.UserStoreReference:
			return Model.UserStoreReference;
		default:
			return;
	}
}
