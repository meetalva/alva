import * as Tsa from 'ts-simple-ast';
import * as Ts from 'typescript';
import { getExportInfos } from './get-export-infos';

const fixtures = require('fixturez')(__dirname);

let project: Tsa.Project;
let sourceFileVariable: Tsa.SourceFile;
let sourceFileVariableMetadata: Tsa.SourceFile;
let sourceFileClass: Tsa.SourceFile;
let sourceFileClassMetadata: Tsa.SourceFile;
let sourceFileDefault: Tsa.SourceFile;
let sourceFileDefaultMetadata: Tsa.SourceFile;
let sourceFileExportDeclaration: Tsa.SourceFile;
let sourceFileExportDeclarationMetadata: Tsa.SourceFile;

beforeAll(() => {
	project = new Tsa.Project();

	const fixturePathVariable = fixtures.find('export-infos-variable.tsx');
	const fixturePathVariableMetadata = fixtures.find('export-infos-variable-metadata.tsx');
	const fixturePathClass = fixtures.find('export-infos-class.tsx');
	const fixturePathClassMetadata = fixtures.find('export-infos-class-metadata.tsx');
	const fixturePathDefault = fixtures.find('export-infos-default.tsx');
	const fixturePathDefaultMetadata = fixtures.find('export-infos-default-metadata.tsx');
	const fixturePathExportDeclaration = fixtures.find('export-infos-export-declaration.js');
	const fixturePathExportDeclarationMetadata = fixtures.find(
		'export-infos-export-declaration-metadata.js'
	);

	project.addExistingSourceFile(fixturePathVariable);
	project.addExistingSourceFile(fixturePathVariableMetadata);
	project.addExistingSourceFile(fixturePathClass);
	project.addExistingSourceFile(fixturePathClassMetadata);
	project.addExistingSourceFile(fixturePathDefault);
	project.addExistingSourceFile(fixturePathDefaultMetadata);
	project.addExistingSourceFile(fixturePathExportDeclaration);
	project.addExistingSourceFile(fixturePathExportDeclarationMetadata);

	sourceFileVariable = project.getSourceFileOrThrow('export-infos-variable.tsx');
	sourceFileVariableMetadata = project.getSourceFileOrThrow('export-infos-variable-metadata.tsx');
	sourceFileClass = project.getSourceFileOrThrow('export-infos-class.tsx');
	sourceFileClassMetadata = project.getSourceFileOrThrow('export-infos-class-metadata.tsx');
	sourceFileDefault = project.getSourceFileOrThrow('export-infos-default.tsx');
	sourceFileDefaultMetadata = project.getSourceFileOrThrow('export-infos-default-metadata.tsx');
	sourceFileExportDeclaration = project.getSourceFileOrThrow('export-infos-default.tsx');
	sourceFileExportDeclarationMetadata = project.getSourceFileOrThrow(
		'export-infos-default-metadata.tsx'
	);
});

test('keep export name independent of meta data: variable statement', () => {
	const program = (project.getProgram().compilerObject as any) as Ts.Program;

	const exportClean = sourceFileVariable
		.getStatements()
		.find(s => Tsa.TypeGuards.isExportableNode(s))!.compilerNode;

	const exportMetadata = sourceFileVariableMetadata
		.getStatements()
		.find(s => Tsa.TypeGuards.isExportableNode(s))!.compilerNode;

	const [cleanExportInfo] = getExportInfos(program, exportClean);
	const [metadataExportInfo] = getExportInfos(program, exportMetadata);

	expect(cleanExportInfo).toEqual(
		expect.objectContaining({
			exportName: metadataExportInfo.exportName
		})
	);
});

test('keep export name independent of meta data: class declaration', () => {
	const program = (project.getProgram().compilerObject as any) as Ts.Program;

	const exportClean = sourceFileClass
		.getStatements()
		.find(s => Tsa.TypeGuards.isExportableNode(s))!.compilerNode;

	const exportMetadata = sourceFileClassMetadata
		.getStatements()
		.find(s => Tsa.TypeGuards.isExportableNode(s))!.compilerNode;

	const [cleanExportInfo] = getExportInfos(program, exportClean);
	const [metadataExportInfo] = getExportInfos(program, exportMetadata);

	expect(cleanExportInfo).toEqual(
		expect.objectContaining({
			exportName: metadataExportInfo.exportName
		})
	);
});

test('keep export name independent of meta data: export assignment', () => {
	const program = (project.getProgram().compilerObject as any) as Ts.Program;

	const exportClean = sourceFileDefault
		.getStatements()
		.find(s => Tsa.TypeGuards.isExportableNode(s))!.compilerNode;

	const exportMetadata = sourceFileDefaultMetadata
		.getStatements()
		.find(s => Tsa.TypeGuards.isExportableNode(s))!.compilerNode;

	const [cleanExportInfo] = getExportInfos(program, exportClean);
	const [metadataExportInfo] = getExportInfos(program, exportMetadata);

	expect(cleanExportInfo).toEqual(
		expect.objectContaining({
			exportName: metadataExportInfo.exportName
		})
	);
});

test('keep export name independent of meta data: export declaration', () => {
	const program = (project.getProgram().compilerObject as any) as Ts.Program;

	const exportClean = sourceFileExportDeclaration
		.getStatements()
		.find(s => Tsa.TypeGuards.isExportableNode(s))!.compilerNode;

	const exportMetadata = sourceFileExportDeclarationMetadata
		.getStatements()
		.find(s => Tsa.TypeGuards.isExportableNode(s))!.compilerNode;

	const [cleanExportInfo] = getExportInfos(program, exportClean);
	const [metadataExportInfo] = getExportInfos(program, exportMetadata);

	expect(cleanExportInfo).toEqual(
		expect.objectContaining({
			exportName: metadataExportInfo.exportName
		})
	);
});
