import * as React from 'react';
import { FileInput, DefaultFileInputInput } from './file-input';

export default () => (
	<>
		<FileInput accept={['text/css']}>
			<FileInput.InputSlot>Input Slot</FileInput.InputSlot>
			<FileInput.ButtonSlot>Button Slot</FileInput.ButtonSlot>
		</FileInput>
		<FileInput accept={['text/css']}>
			<FileInput.InputSlot>
				<DefaultFileInputInput />
			</FileInput.InputSlot>
			<FileInput.ButtonSlot>Button Slot</FileInput.ButtonSlot>
		</FileInput>
	</>
);
