import React, { useState, useCallback, useEffect } from 'react';
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
import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLE } from '../../../apollo/user/query';
import { T } from '../../types/common';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';

// ── Force toolbar re-render on editor state change ────────────────────────────
const useEditorForceUpdate = (editor: any) => {
	const [, setTick] = useState(0);
	React.useEffect(() => {
		if (!editor) return;
		const handler = () => setTick((t) => t + 1);
		editor.on('transaction', handler);
		editor.on('selectionUpdate', handler);
		return () => {
			editor.off('transaction', handler);
			editor.off('selectionUpdate', handler);
		};
	}, [editor]);
};

// ── Toolbar button ────────────────────────────────────────────────────────────
const ToolbarBtn = ({
	onClick,
	active,
	title,
	disabled,
	children,
}: {
	onClick: () => void;
	active?: boolean;
	title?: string;
	disabled?: boolean;
	children: React.ReactNode;
}) => (
	<button
		type="button"
		className={['tiptap-toolbar__btn', active ? 'is-active' : '', disabled ? 'is-disabled' : '']
			.filter(Boolean)
			.join(' ')}
		title={title}
		disabled={disabled}
		onMouseDown={(e) => {
			e.preventDefault();
			if (!disabled) onClick();
		}}
	>
		{children}
	</button>
);

const Sep = () => <span className="tiptap-toolbar__sep" />;

// ── Upload helper ─────────────────────────────────────────────────────────────
const uploadImages = async (files: File[], token: string): Promise<string[]> => {
	if (files.length === 0) return [];

	const formData = new FormData();
	formData.append(
		'operations',
		JSON.stringify({
			query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }`,
			variables: { files: new Array(files.length).fill(null), target: 'article' },
		}),
	);

	const mapObj: Record<string, string[]> = {};
	files.forEach((_, i) => {
		mapObj[`${i}`] = [`variables.files.${i}`];
	});
	formData.append('map', JSON.stringify(mapObj));
	files.forEach((file, i) => formData.append(`${i}`, file));

	const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
		headers: {
			'apollo-require-preflight': 'true',
			Authorization: `Bearer ${token}`,
		},
	});

	if (response.data.errors) {
		throw new Error(response.data.errors.map((e: any) => e.message).join(', '));
	}

	return response.data.data.imagesUploader ?? [];
};

// ── Main component ────────────────────────────────────────────────────────────
interface TiptapEditorProps {
	editId?: string;
}

const TiptapEditor = ({ editId }: TiptapEditorProps) => {
	const token = getJwtToken();
	const router = useRouter();
	const isEdit = !!editId;

	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.QUESTION);
	const [articleTitle, setArticleTitle] = useState('');
	const [coverPath, setCoverPath] = useState('');
	const [coverPreview, setCoverPreview] = useState('');
	const [coverUploading, setCoverUploading] = useState(false);
	const [imgUploading, setImgUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [editorReady, setEditorReady] = useState(false);

	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	// ── Load existing article for edit ────────────────────────────────────────
	const { data: editData } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: { input: editId },
		skip: !editId,
	});

	useEffect(() => {
		const article = editData?.getBoardArticle;
		if (!article) return;
		setArticleTitle(article.articleTitle ?? '');
		setArticleCategory(article.articleCategory ?? BoardArticleCategory.QUESTION);
		if (article.articleImage?.[0]) {
			setCoverPath(article.articleImage[0]);
			setCoverPreview(`${process.env.NEXT_PUBLIC_API_URL}/${article.articleImage[0]}`);
		}
	}, [editData]);

	// ── Editor setup ──────────────────────────────────────────────────────────
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({ link: false }),
			Underline,
			Image.configure({ inline: false, allowBase64: false }),
			Link.configure({ openOnClick: false, autolink: true }),
			Table.configure({ resizable: true }),
			TableRow,
			TableHeader,
			TableCell,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			Placeholder.configure({ placeholder: 'Start writing your article…' }),
		],
		content: '',
		onCreate: () => setEditorReady(true),
	});

	useEditorForceUpdate(editor);

	// ── Populate editor content once both editor and data are ready ───────────
	useEffect(() => {
		const article = editData?.getBoardArticle;
		if (editorReady && editor && article?.articleContent) {
			editor.commands.setContent(article.articleContent);
		}
	}, [editorReady, editData, editor]);

	// ── Cover image upload ────────────────────────────────────────────────────
	const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setCoverUploading(true);
		try {
			const paths = await uploadImages([file], token);
			if (paths?.[0]) {
				setCoverPath(paths[0]);
				setCoverPreview(`${process.env.NEXT_PUBLIC_API_URL}/${paths[0]}`);
			}
		} catch (err) {
			toastErrorHandling(err);
		} finally {
			setCoverUploading(false);
			e.target.value = '';
		}
	};

	const removeCover = () => {
		setCoverPath('');
		setCoverPreview('');
	};

	// ── Content image insert ──────────────────────────────────────────────────
	const handleContentImageInsert = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/jpg,image/jpeg,image/png,image/webp';
		input.onchange = async (e: any) => {
			const file = e.target.files?.[0];
			if (!file || !editor) return;
			setImgUploading(true);
			try {
				const paths = await uploadImages([file], token);
				if (paths?.[0]) {
					const url = `${process.env.NEXT_PUBLIC_API_URL}/${paths[0]}`;
					editor.chain().focus().setImage({ src: url }).run();
				}
			} catch (err) {
				toastErrorHandling(err);
			} finally {
				setImgUploading(false);
			}
		};
		input.click();
	};

	// ── Link ──────────────────────────────────────────────────────────────────
	const handleSetLink = useCallback(() => {
		const prev = editor?.getAttributes('link').href ?? '';
		const rawUrl = window.prompt('Enter URL (e.g. https://example.com)', prev);
		if (rawUrl === null) return;
		if (rawUrl === '') {
			editor?.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
		editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}, [editor]);

	// ── Table ─────────────────────────────────────────────────────────────────
	const handleInsertTable = () => {
		editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
	};

	// ── Publish / Save ────────────────────────────────────────────────────────
	const canPublish = articleTitle.trim().length > 0 && (editor?.getText().trim().length ?? 0) > 0;

	const handleSubmit = async () => {
		if (!canPublish || submitting) return;
		try {
			setSubmitting(true);

			if (isEdit) {
				await updateBoardArticle({
					variables: {
						input: {
							_id: editId,
							articleTitle: articleTitle.trim(),
							articleContent: editor?.getHTML() ?? '',
							articleImage: coverPath ? [coverPath] : [],
						},
					},
				});
				toastSmallSuccess('Article updated!', 700);
			} else {
				await createBoardArticle({
					variables: {
						input: {
							articleTitle: articleTitle.trim(),
							articleContent: editor?.getHTML() ?? '',
							articleCategory,
							articleImage: coverPath ? [coverPath] : [],
						},
					},
				});
				toastSmallSuccess('Article published!', 700);
			}

			router.push({ pathname: '/mypage', query: { category: 'myArticles' } });
		} catch (err: any) {
			toastErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<div className="tiptap-editor">
			{/* Cover image */}
			<div className="tiptap-cover">
				<span className="tiptap-cover__label">Cover Image</span>
				{coverPreview ? (
					<div className="tiptap-cover__preview-wrap">
						<img src={coverPreview} alt="Cover" className="tiptap-cover__preview" />
						<button className="tiptap-cover__remove" type="button" onClick={removeCover} title="Remove cover">
							<CloseIcon sx={{ fontSize: 16 }} />
						</button>
					</div>
				) : (
					<label className={`tiptap-cover__upload${coverUploading ? ' tiptap-cover__upload--loading' : ''}`}>
						<AddPhotoAlternateOutlinedIcon sx={{ fontSize: 28 }} />
						<span>{coverUploading ? 'Uploading…' : 'Upload cover image'}</span>
						<span className="tiptap-cover__hint">JPG, PNG · recommended 1200×630</span>
						<input
							type="file"
							accept="image/jpg,image/jpeg,image/png,image/webp"
							hidden
							disabled={coverUploading}
							onChange={handleCoverUpload}
						/>
					</label>
				)}
			</div>

			{/* Meta: category + title */}
			<div className="tiptap-meta">
				<div className="tiptap-meta__field">
					<label htmlFor="ta-category">Category</label>
					<select
						id="ta-category"
						className="tiptap-meta__select"
						value={articleCategory}
						onChange={(e) => setArticleCategory(e.target.value as BoardArticleCategory)}
					>
						<option value={BoardArticleCategory.QUESTION}>Question</option>
						<option value={BoardArticleCategory.REVIEW}>Review</option>
						<option value={BoardArticleCategory.DISCUSSION}>Discussion</option>
						<option value={BoardArticleCategory.HELP}>Help</option>
						<option value={BoardArticleCategory.SHOWCASE}>Showcase</option>
					</select>
				</div>
				<div className="tiptap-meta__field">
					<label htmlFor="ta-title">
						Title <span className="tiptap-meta__required">*</span>
					</label>
					<input
						id="ta-title"
						className="tiptap-meta__input"
						type="text"
						placeholder="Enter article title…"
						value={articleTitle}
						onChange={(e) => setArticleTitle(e.target.value)}
					/>
				</div>
			</div>

			{/* Toolbar */}
			<div className="tiptap-toolbar">
				{/* Text */}
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

				<Sep />

				{/* Headings */}
				<ToolbarBtn
					onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
					active={editor?.isActive('heading', { level: 1 })}
					title="Heading 1"
				>
					H1
				</ToolbarBtn>
				<ToolbarBtn
					onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
					active={editor?.isActive('heading', { level: 2 })}
					title="Heading 2"
				>
					H2
				</ToolbarBtn>
				<ToolbarBtn
					onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
					active={editor?.isActive('heading', { level: 3 })}
					title="Heading 3"
				>
					H3
				</ToolbarBtn>

				<Sep />

				{/* Alignment */}
				<ToolbarBtn
					onClick={() => editor?.chain().focus().setTextAlign('left').run()}
					active={editor?.isActive({ textAlign: 'left' })}
					title="Left"
				>
					⬅
				</ToolbarBtn>
				<ToolbarBtn
					onClick={() => editor?.chain().focus().setTextAlign('center').run()}
					active={editor?.isActive({ textAlign: 'center' })}
					title="Center"
				>
					☰
				</ToolbarBtn>
				<ToolbarBtn
					onClick={() => editor?.chain().focus().setTextAlign('right').run()}
					active={editor?.isActive({ textAlign: 'right' })}
					title="Right"
				>
					➡
				</ToolbarBtn>

				<Sep />

				{/* Lists */}
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

				<Sep />

				{/* Media */}
				<ToolbarBtn onClick={handleContentImageInsert} disabled={imgUploading} title="Insert image">
					{imgUploading ? '⏳' : '🖼'}
				</ToolbarBtn>
				<ToolbarBtn onClick={handleSetLink} active={editor?.isActive('link')} title="Link">
					🔗
				</ToolbarBtn>

				{/* Table controls */}
				{editor?.isActive('table') ? (
					<>
						<Sep />
						<ToolbarBtn onClick={() => editor?.chain().focus().addColumnBefore().run()} title="Add column before">
							Col←
						</ToolbarBtn>
						<ToolbarBtn onClick={() => editor?.chain().focus().addColumnAfter().run()} title="Add column after">
							Col→
						</ToolbarBtn>
						<ToolbarBtn onClick={() => editor?.chain().focus().deleteColumn().run()} title="Delete column">
							Del Col
						</ToolbarBtn>
						<ToolbarBtn onClick={() => editor?.chain().focus().addRowBefore().run()} title="Add row before">
							Row↑
						</ToolbarBtn>
						<ToolbarBtn onClick={() => editor?.chain().focus().addRowAfter().run()} title="Add row after">
							Row↓
						</ToolbarBtn>
						<ToolbarBtn onClick={() => editor?.chain().focus().deleteRow().run()} title="Delete row">
							Del Row
						</ToolbarBtn>
						<ToolbarBtn onClick={() => editor?.chain().focus().deleteTable().run()} title="Delete table">
							Del Table
						</ToolbarBtn>
					</>
				) : (
					<ToolbarBtn onClick={handleInsertTable} title="Insert table">
						⊞ Table
					</ToolbarBtn>
				)}

				<Sep />

				{/* Block */}
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
				<ToolbarBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider">
					—
				</ToolbarBtn>

				<Sep />

				{/* History */}
				<ToolbarBtn onClick={() => editor?.chain().undo().run()} disabled={!editor?.can().undo()} title="Undo">
					↩
				</ToolbarBtn>
				<ToolbarBtn onClick={() => editor?.chain().redo().run()} disabled={!editor?.can().redo()} title="Redo">
					↪
				</ToolbarBtn>
			</div>

			{/* Editor area */}
			<div className="tiptap-content">
				<EditorContent editor={editor} />
			</div>

			{/* Footer */}
			<div className="tiptap-footer">
				<button
					className="tiptap-footer__cancel"
					type="button"
					onClick={() => router.push({ pathname: '/mypage', query: { category: 'myArticles' } })}
				>
					Cancel
				</button>
				<button
					className={`tiptap-footer__submit${!canPublish ? ' tiptap-footer__submit--disabled' : ''}`}
					type="button"
					disabled={submitting || !canPublish}
					onClick={handleSubmit}
					title={!canPublish ? 'Please add a title and some content first' : undefined}
				>
					{submitting ? (isEdit ? 'Saving…' : 'Publishing…') : isEdit ? 'Save Changes' : 'Publish Article'}
				</button>
			</div>
		</div>
	);
};

export default TiptapEditor;
