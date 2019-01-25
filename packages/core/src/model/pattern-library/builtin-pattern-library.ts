// tslint:disable-next-line:no-submodule-imports
import { analysis } from '@meetalva/essentials';
import { PatternLibrary } from './pattern-library';
import * as Types from '../../types';

export const builtinPatternLibrary = PatternLibrary.from(
	(analysis as unknown) as Types.SerializedPatternLibrary
);
