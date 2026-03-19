import React, { useState } from 'react';
import { Box, Button, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { getJwtToken } from '../../auth';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Message } from '../../enums/common.enum';
import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';

const ToolbarBtn = ({
	onClick,
	active,
	title,
	children,
}: {
	onClick: () => void;
	active?: boolean;
	title?: string;
	children: React.ReactNode;
}) => (
	<button
		type="button"
		onMouseDown={(e) => {
			e.preventDefault();
			onClick();
		}}
		title={title}
		style={{
			padding: '4px 8px',
			borderRadius: 4,
			border: '1px solid #ddd',
			background: active ? '#e3e8ef' : 'white',
			cursor: 'pointer',
			fontWeight: active ? 700 : 400,
			fontSize: 13,
			minWidth: 28,
		}}
	>
		{children}
	</button>
);

const TiptapEditor = () => {
	const token = getJwtToken();
	const router = useRouter();
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.QUESTION);
	const [articleTitle, setArticleTitle] = useState('');
	const [articleImage, setArticleImage] = useState('');

	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit,
			Underline,
			Image.configure({ inline: false, allowBase64: true }),
			Link.configure({ openOnClick: false, autolink: true }),
			Table.configure({ resizable: true }),
			TableRow,
			TableHeader,
			TableCell,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			Placeholder.configure({ placeholder: 'Type here…' }),
		],
		content: '',
	});

	const uploadImage = async (file: File): Promise<string | undefined> => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}`,
					variables: { file: null, target: 'article' },
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', file);

			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			setArticleImage(responseImage);
			return `${process.env.NEXT_PUBLIC_API_URL}/${responseImage}`;
		} catch (err) {
			console.error('Error, uploadImage:', err);
		}
	};

	const handleImageInsert = async () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = async (e: any) => {
			const file = e.target.files?.[0];
			if (!file || !editor) return;
			const url = await uploadImage(file);
			if (url) editor.chain().focus().setImage({ src: url }).run();
		};
		input.click();
	};

	const handleRegisterButton = async () => {
		try {
			const articleContent = editor?.getHTML() ?? '';
			if (!articleContent || !articleTitle.trim()) throw new Error(Message.MISSING_REQUIRED_FIELDS);

			await createBoardArticle({
				variables: {
					input: {
						articleTitle: articleTitle.trim(),
						articleContent,
						articleImage,
						articleCategory,
					},
				},
			});

			toastSmallSuccess('Article is created successfully', 700);
			router.push({ pathname: '/mypage', query: { category: 'myArticles' } });
		} catch (err: any) {
			console.error('Error, handleRegisterButton:', err);
			toastErrorHandling(err);
		}
	};

	const addLink = () => {
		const url = window.prompt('URL');
		if (!url || !editor) return;
		editor.chain().focus().setLink({ href: url }).run();
	};

	const addTable = () => {
		editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
	};

	return (
		<Stack>
			<Stack direction="row" style={{ margin: '40px' }} justifyContent="space-evenly">
				<Box component="div" className="form_row" style={{ width: '300px' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Category
					</Typography>
					<FormControl sx={{ width: '100%', background: 'white' }}>
						<Select
							value={articleCategory}
							onChange={(e) => setArticleCategory(e.target.value as BoardArticleCategory)}
							displayEmpty
							inputProps={{ 'aria-label': 'Without label' }}
						>
							<MenuItem value={BoardArticleCategory.QUESTION}>Question</MenuItem>
							<MenuItem value={BoardArticleCategory.REVIEW}>Review</MenuItem>
							<MenuItem value={BoardArticleCategory.DISCUSSION}>Discussion</MenuItem>
							<MenuItem value={BoardArticleCategory.HELP}>Help</MenuItem>
							<MenuItem value={BoardArticleCategory.SHOWCASE}>Showcase</MenuItem>
						</Select>
					</FormControl>
				</Box>

				<Box component="div" style={{ width: '300px', flexDirection: 'column' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Title
					</Typography>
					<TextField
						value={articleTitle}
						onChange={(e) => setArticleTitle(e.target.value)}
						id="filled-basic"
						label="Type Title"
						style={{ width: '300px', background: 'white' }}
					/>
				</Box>
			</Stack>

			<Box sx={{ mx: '40px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: '4px',
						p: '8px 12px',
						borderBottom: '1px solid #eee',
						background: '#fafafa',
					}}
				>
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleBold().run()}
						active={editor?.isActive('bold')}
						title="Bold"
					>
						<b>B</b>
					</ToolbarBtn>
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleItalic().run()}
						active={editor?.isActive('italic')}
						title="Italic"
					>
						<i>I</i>
					</ToolbarBtn>
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleUnderline().run()}
						active={editor?.isActive('underline')}
						title="Underline"
					>
						<u>U</u>
					</ToolbarBtn>
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleStrike().run()}
						active={editor?.isActive('strike')}
						title="Strikethrough"
					>
						<s>S</s>
					</ToolbarBtn>
					<Box sx={{ width: 1, height: 24, borderLeft: '1px solid #ddd', mx: '2px' }} />
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
						active={editor?.isActive('heading', { level: 1 })}
						title="H1"
					>
						H1
					</ToolbarBtn>
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
						active={editor?.isActive('heading', { level: 2 })}
						title="H2"
					>
						H2
					</ToolbarBtn>
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
						active={editor?.isActive('heading', { level: 3 })}
						title="H3"
					>
						H3
					</ToolbarBtn>
					<Box sx={{ width: 1, height: 24, borderLeft: '1px solid #ddd', mx: '2px' }} />
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleBulletList().run()}
						active={editor?.isActive('bulletList')}
						title="Bullet list"
					>
						• List
					</ToolbarBtn>
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleOrderedList().run()}
						active={editor?.isActive('orderedList')}
						title="Ordered list"
					>
						1. List
					</ToolbarBtn>
					<Box sx={{ width: 1, height: 24, borderLeft: '1px solid #ddd', mx: '2px' }} />
					<ToolbarBtn onClick={handleImageInsert} title="Insert image">
						🖼 Image
					</ToolbarBtn>
					<ToolbarBtn onClick={addLink} active={editor?.isActive('link')} title="Insert link">
						🔗 Link
					</ToolbarBtn>
					<ToolbarBtn onClick={addTable} title="Insert table">
						⊞ Table
					</ToolbarBtn>
					<Box sx={{ width: 1, height: 24, borderLeft: '1px solid #ddd', mx: '2px' }} />
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleBlockquote().run()}
						active={editor?.isActive('blockquote')}
						title="Blockquote"
					>
						❝
					</ToolbarBtn>
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleCode().run()}
						active={editor?.isActive('code')}
						title="Inline code"
					>
						{'</>'}
					</ToolbarBtn>
					<ToolbarBtn
						onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
						active={editor?.isActive('codeBlock')}
						title="Code block"
					>
						{'{ }'}
					</ToolbarBtn>
					<Box sx={{ width: 1, height: 24, borderLeft: '1px solid #ddd', mx: '2px' }} />
					<ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">
						↩
					</ToolbarBtn>
					<ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">
						↪
					</ToolbarBtn>
				</Box>

				<Box
					sx={{
						minHeight: '580px',
						p: '16px 20px',
						'& .ProseMirror': { minHeight: '540px', outline: 'none', fontSize: '15px', lineHeight: 1.7 },
						'& .ProseMirror p.is-editor-empty:first-child::before': {
							content: 'attr(data-placeholder)',
							color: '#adb5bd',
							pointerEvents: 'none',
							float: 'left',
							height: 0,
						},
					}}
				>
					<EditorContent editor={editor} />
				</Box>
			</Box>

			<Stack direction="row" justifyContent="center">
				<Button
					variant="contained"
					color="primary"
					style={{ margin: '30px', width: '250px', height: '45px' }}
					onClick={handleRegisterButton}
				>
					Register
				</Button>
			</Stack>
		</Stack>
	);
};

export default TiptapEditor;
