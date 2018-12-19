import * as React from 'react';

export enum FileFormat {
	Text,
	Binary
}

export interface FileInputProps {
	accept?: string;
	format?: FileFormat;
	onChange?(result: string): void;
}

export const FileInput: React.SFC<FileInputProps> = function FileInput(props) {
	return (
		<input
			type="file"
			style={{ position: 'fixed', left: '-100vw' }}
			accept={props.accept}
			onChange={e => {
				if (e.target.files === null) {
					return;
				}

				const file = e.target.files[0];

				if (!file) {
					return;
				}

				const reader = new FileReader();

				(() => {
					switch (props.format) {
						case FileFormat.Binary:
							reader.readAsDataURL(file);
							break;
						case FileFormat.Text:
						default:
							reader.readAsText(file, 'UTF-8');
					}
				})();

				reader.onload = async o => {
					if (!o.target) {
						return;
					}

					if (props.onChange) {
						props.onChange(reader.result as string);
					}
				};
			}}
		/>
	);
};
