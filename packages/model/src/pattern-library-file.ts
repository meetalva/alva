import { PatternLibrary } from './pattern-library';
import * as Types from '@meetalva/types';

export interface PatternLibraryFileInit {
	id: string;
	relativePath: string;
	content: Buffer;
}

export interface ProjectFileContext {
	patternLibrary: PatternLibrary;
}

export class PatternLibraryFile {
	private readonly content: Buffer;
	private readonly id: string;
	private readonly relativePath: string;

	public constructor(init: PatternLibraryFileInit, context: ProjectFileContext) {
		this.id = init.id;
		this.relativePath = init.relativePath;
		this.content = init.content;
	}

	public from(
		serialized: Types.SerializedPatternLibraryFile,
		context: ProjectFileContext
	): PatternLibraryFile {
		return new PatternLibraryFile(serialized, context);
	}

	public getId(): string {
		return this.id;
	}

	public getContent(): Buffer {
		return this.content;
	}

	public getRelativePath(): string {
		return this.relativePath;
	}

	public toJSON(): Types.SerializedPatternLibraryFile {
		return {
			content: this.content,
			id: this.id,
			relativePath: this.relativePath
		};
	}
}
