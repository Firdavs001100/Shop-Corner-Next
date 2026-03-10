import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

interface TiptapViewerProps {
	markdown?: string;
	className?: string;
}

const TiptapViewer = ({ markdown, className }: TiptapViewerProps) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const editor = useEditor(
		{
			immediatelyRender: false,
			extensions: [
				StarterKit,
				Image.configure({ inline: false, allowBase64: true }),
				Link.configure({ openOnClick: true, autolink: true }),
				Table.configure({ resizable: true }),
				TableRow,
				TableHeader,
				TableCell,
			],
			content: markdown ?? '',
			editable: false,
		},
		[markdown],
	);

	if (!mounted || !markdown) return null;

	return (
		<div className={className}>
			<EditorContent editor={editor} className="tiptap-viewer" />
		</div>
	);
};

export default TiptapViewer;
