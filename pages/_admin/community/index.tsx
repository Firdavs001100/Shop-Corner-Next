import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { NEXT_PUBLIC_API_URL } from '../../../libs/config';
import { toastSmallSuccess, toastErrorHandling } from '../../../libs/toast';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_BOARD_ARTICLE_BY_ADMIN, REMOVE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { BoardArticle } from '../../../libs/types/board-article/board-article';

const fd = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const stripHtml = (html: string) =>
	html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const STATUS_META: Record<BoardArticleStatus, { label: string; bg: string; color: string; dot: string }> = {
	[BoardArticleStatus.ACTIVE]: { label: 'Active', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
	[BoardArticleStatus.HIDDEN]: { label: 'Hidden', bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
	[BoardArticleStatus.DELETE]: { label: 'Deleted', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
};

const CATEGORY_META: Record<BoardArticleCategory, { label: string; bg: string; color: string }> = {
	[BoardArticleCategory.QUESTION]: { label: 'Question', bg: '#dbeafe', color: '#1d4ed8' },
	[BoardArticleCategory.REVIEW]: { label: 'Review', bg: '#dcfce7', color: '#15803d' },
	[BoardArticleCategory.DISCUSSION]: { label: 'Discussion', bg: '#ede9fe', color: '#6d28d9' },
	[BoardArticleCategory.HELP]: { label: 'Help', bg: '#fee2e2', color: '#b91c1c' },
	[BoardArticleCategory.SHOWCASE]: { label: 'Showcase', bg: '#fef9c3', color: '#a16207' },
};

const CATEGORY_ICONS: Record<BoardArticleCategory, React.ReactNode> = {
	[BoardArticleCategory.QUESTION]: (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</svg>
	),
	[BoardArticleCategory.REVIEW]: (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
		</svg>
	),
	[BoardArticleCategory.DISCUSSION]: (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
		</svg>
	),
	[BoardArticleCategory.HELP]: (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M3 18v-6a9 9 0 0 1 18 0v6" />
			<path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
		</svg>
	),
	[BoardArticleCategory.SHOWCASE]: (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
		</svg>
	),
};

const StatusChip = ({ status }: { status: BoardArticleStatus }) => {
	const m = STATUS_META[status] ?? STATUS_META[BoardArticleStatus.ACTIVE];
	return (
		<span className="ao-chip" style={{ background: m.bg, color: m.color }}>
			<span className="ao-chip__dot" style={{ background: m.dot }} />
			{m.label}
		</span>
	);
};

const CategoryBadge = ({ category }: { category: BoardArticleCategory }) => {
	const m = CATEGORY_META[category] ?? CATEGORY_META[BoardArticleCategory.QUESTION];
	return (
		<span className="am-type-badge" style={{ background: m.bg, color: m.color }}>
			{m.label}
		</span>
	);
};

const ConfirmDelete = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
	<div className="admin-modal-overlay" onClick={onCancel}>
		<div className="ap-modal ap-modal--sm" onClick={(e) => e.stopPropagation()}>
			<div className="ap-modal__header">
				<div className="ap-modal__header-icon ap-modal__header-icon--danger">
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
						<path d="M10 11v6" />
						<path d="M14 11v6" />
						<path d="M9 6V4h6v2" />
					</svg>
				</div>
				<div>
					<h3 className="ap-modal__title">Delete Article</h3>
					<p className="ap-modal__subtitle">This action cannot be undone.</p>
				</div>
			</div>
			<div className="ap-modal__body">
				<p className="ap-confirm__text">Are you sure you want to permanently delete this article?</p>
				<div className="ap-modal__footer">
					<button className="ap-btn ap-btn--ghost" onClick={onCancel}>
						Cancel
					</button>
					<button className="ap-btn ap-btn--danger" onClick={onConfirm}>
						Delete Article
					</button>
				</div>
			</div>
		</div>
	</div>
);

const ArticleViewModal = ({
	article,
	onClose,
	onUpdateStatus,
	onDelete,
}: {
	article: any;
	onClose: () => void;
	onUpdateStatus: (id: string, s: BoardArticleStatus) => Promise<void>;
	onDelete: (id: string) => void;
}) => {
	const [localStatus, setLocalStatus] = useState<BoardArticleStatus>(article.articleStatus);
	const [updating, setUpdating] = useState(false);

	const handleStatus = async (s: BoardArticleStatus) => {
		if (s === localStatus) return;
		setUpdating(true);
		try {
			await onUpdateStatus(article._id, s);
			setLocalStatus(s);
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="admin-modal-overlay" onClick={onClose}>
			<div className="aa-view-modal" onClick={(e) => e.stopPropagation()}>
				<div className="aa-view-modal__header">
					<div className="aa-view-modal__header-meta">
						<CategoryBadge category={article.articleCategory} />
						<StatusChip status={localStatus} />
					</div>
					<button className="ap-modal__close" onClick={onClose}>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
				<div className="aa-view-modal__body">
					<div className="aa-view-modal__author">
						{article.memberData?.memberImage ? (
							<img
								src={`${NEXT_PUBLIC_API_URL}/${article.memberData.memberImage}`}
								alt={article.memberData.memberNick}
								className="aa-view-modal__author-img"
							/>
						) : (
							<div className="aa-view-modal__author-placeholder">
								{article.memberData?.memberNick?.[0]?.toUpperCase() ?? 'A'}
							</div>
						)}
						<div>
							<p className="aa-view-modal__author-nick">{article.memberData?.memberNick ?? 'Anonymous'}</p>
							<p className="aa-view-modal__author-date">{fd(article.createdAt)}</p>
						</div>
					</div>
					<h3 className="aa-view-modal__title">{article.articleTitle}</h3>
					{article.articleImage && article.articleImage.length > 0 && (
						<div className="aa-view-modal__images">
							{article.articleImage.map((img: string, i: number) => (
								<div key={i} className="aa-view-modal__img-wrap">
									<img src={`${NEXT_PUBLIC_API_URL}/${img}`} alt="" />
								</div>
							))}
						</div>
					)}
					<div className="aa-view-modal__content" dangerouslySetInnerHTML={{ __html: article.articleContent }} />
					<div className="aa-view-modal__stats">
						<span className="aa-view-modal__stat">
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
							{article.articleViews} views
						</span>
						<span className="aa-view-modal__stat">
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							{article.articleLikes} likes
						</span>
						<span className="aa-view-modal__stat">
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
							</svg>
							{article.articleComments} comments
						</span>
					</div>
					<div className="aa-view-modal__controls">
						<p className="aa-view-modal__control-label">Change Status</p>
						<div className="aa-view-modal__status-btns">
							{Object.values(BoardArticleStatus).map((s) => (
								<button
									key={s}
									disabled={updating}
									className={`am-detail-modal__status-btn ${
										localStatus === s ? 'am-detail-modal__status-btn--active' : ''
									}`}
									style={
										localStatus === s
											? { background: STATUS_META[s].bg, color: STATUS_META[s].color, borderColor: STATUS_META[s].dot }
											: {}
									}
									onClick={() => handleStatus(s)}
								>
									{STATUS_META[s].label}
								</button>
							))}
						</div>
					</div>
					<div className="ap-modal__footer">
						<button className="ap-btn ap-btn--danger" onClick={() => onDelete(article._id)}>
							Delete Permanently
						</button>
						<button className="ap-btn ap-btn--ghost" onClick={onClose}>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

const AdminArticles: NextPage = () => {
	const [page, setPage] = useState(1);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [total, setTotal] = useState(0);
	const [categoryFilter, setCategoryFilter] = useState<BoardArticleCategory | ''>('');
	const [statusFilter, setStatusFilter] = useState<BoardArticleStatus | ''>('');
	const [viewTarget, setViewTarget] = useState<any | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
	const LIMIT = 10;

	const { data, loading, refetch } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page,
				limit: LIMIT,
				search: {
					...(categoryFilter && { articleCategory: categoryFilter }),
					...(statusFilter && { articleStatus: statusFilter }),
				},
			},
		},
	});

	useEffect(() => {
		if (data) {
			setArticles(data?.getAllBoardArticlesByAdmin?.list ?? []);
			setTotal(data?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0);
		}
	}, [data]);

	useEffect(() => {
		setPage(1);
	}, [categoryFilter, statusFilter]);

	const [updateArticle] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeArticle] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

	const handleUpdateStatus = async (id: string, articleStatus: BoardArticleStatus): Promise<void> => {
		await updateArticle({ variables: { input: { _id: id, articleStatus } } });
		toastSmallSuccess('Status updated', 800);
		setArticles((p) => p.map((a) => (a._id === id ? { ...a, articleStatus } : a)));
		refetch();
	};

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return;
		try {
			await removeArticle({ variables: { input: deleteTarget } });
			toastSmallSuccess('Deleted', 800);
			setDeleteTarget(null);
			setViewTarget(null);
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const totalPages = Math.ceil(total / LIMIT);

	return (
		<div className="admin-section">
			<div className="ap-page-header">
				<div>
					<h1 className="ap-page-header__title">Articles</h1>
					<p className="ap-page-header__sub">
						Moderate community posts and discussions
						{total > 0 && <span className="ap-page-header__accent"> · {total} articles</span>}
					</p>
				</div>
			</div>

			<div className="an-category-tabs">
				<button
					className={`an-category-tab ${categoryFilter === '' ? 'an-category-tab--active' : ''}`}
					onClick={() => setCategoryFilter('')}
				>
					All
				</button>
				{Object.values(BoardArticleCategory).map((c) => (
					<button
						key={c}
						className={`an-category-tab ${categoryFilter === c ? 'an-category-tab--active' : ''}`}
						onClick={() => setCategoryFilter(c)}
					>
						{CATEGORY_META[c].label}
					</button>
				))}
			</div>

			<div className="ap-toolbar">
				<div className="ap-toolbar__filters" style={{ marginLeft: 0 }}>
					<select
						className="ap-filter-select"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as BoardArticleStatus | '')}
					>
						<option value="">All Statuses</option>
						{Object.values(BoardArticleStatus).map((s) => (
							<option key={s} value={s}>
								{STATUS_META[s].label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="ap-table-card">
				{loading ? (
					<div className="ap-skeleton">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="ap-skeleton__row" style={{ animationDelay: `${i * 0.06}s` }} />
						))}
					</div>
				) : (
					<div className="ap-table-scroll">
						<table className="ap-table">
							<thead>
								<tr>
									<th>Article</th>
									<th>Author</th>
									<th>Category</th>
									<th>Views</th>
									<th>Likes</th>
									<th>Comments</th>
									<th>Status</th>
									<th>Date</th>
									<th style={{ textAlign: 'right' }}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{articles.length === 0 ? (
									<tr>
										<td colSpan={9}>
											<div className="ap-empty">
												<div className="ap-empty__icon">
													<svg
														width="32"
														height="32"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
													</svg>
												</div>
												<p className="ap-empty__title">No articles found</p>
												<p className="ap-empty__sub">Articles will appear here once members start posting</p>
											</div>
										</td>
									</tr>
								) : (
									articles.map((a) => (
										<tr key={a._id} className="ap-table__row">
											<td>
												<div className="aa-article-cell">
													{a.articleImage?.[0] ? (
														<div className="aa-article-cell__img-wrap">
															<img src={`${NEXT_PUBLIC_API_URL}/${a.articleImage[0]}`} alt={a.articleTitle} />
														</div>
													) : (
														<div
															className="aa-article-cell__icon-wrap"
															style={{
																color: CATEGORY_META[a.articleCategory]?.color,
																background: CATEGORY_META[a.articleCategory]?.bg,
															}}
														>
															{CATEGORY_ICONS[a.articleCategory as BoardArticleCategory]}
														</div>
													)}
													<div>
														<p className="aa-article-cell__title">{a.articleTitle}</p>
														<p className="aa-article-cell__preview">{stripHtml(a.articleContent)}</p>
													</div>
												</div>
											</td>
											<td>
												<div className="ap-product-cell">
													{a.memberData?.memberImage ? (
														<img
															src={`${NEXT_PUBLIC_API_URL}/${a.memberData.memberImage}`}
															alt={a.memberData.memberNick}
															style={{
																width: 32,
																height: 32,
																borderRadius: '50%',
																objectFit: 'cover',
																flexShrink: 0,
																border: '1.5px solid #e2e8f0',
															}}
														/>
													) : (
														<div className="am-avatar-placeholder" style={{ width: 32, height: 32, fontSize: 12 }}>
															{a.memberData?.memberNick?.[0]?.toUpperCase() ?? 'A'}
														</div>
													)}
													<span className="ap-product-cell__name" style={{ maxWidth: 100 }}>
														{a.memberData?.memberNick ?? '—'}
													</span>
												</div>
											</td>
											<td>
												<CategoryBadge category={a.articleCategory} />
											</td>
											<td>
												<span className="ap-num-cell">{a.articleViews}</span>
											</td>
											<td>
												<span className="ap-num-cell">{a.articleLikes}</span>
											</td>
											<td>
												<span className="ap-num-cell">{a.articleComments}</span>
											</td>
											<td>
												<div className="ao-select-wrap">
													<StatusChip status={a.articleStatus} />
													<select
														className="ao-select-overlay"
														value={a.articleStatus}
														onChange={async (e) => {
															try {
																await handleUpdateStatus(a._id, e.target.value as BoardArticleStatus);
															} catch (err: any) {
																toastErrorHandling(err);
															}
														}}
													>
														{Object.values(BoardArticleStatus).map((s) => (
															<option key={s} value={s}>
																{STATUS_META[s].label}
															</option>
														))}
													</select>
												</div>
											</td>
											<td>
												<span className="ap-date-cell">{fd(a.createdAt)}</span>
											</td>
											<td>
												<div className="ap-row-actions">
													<button className="ap-row-btn ap-row-btn--edit" onClick={() => setViewTarget(a)}>
														<svg
															width="13"
															height="13"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
															<circle cx="12" cy="12" r="3" />
														</svg>
														View
													</button>
													<button className="ap-row-btn ap-row-btn--delete" onClick={() => setDeleteTarget(a._id)}>
														<svg
															width="13"
															height="13"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<polyline points="3 6 5 6 21 6" />
															<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
															<path d="M10 11v6" />
															<path d="M14 11v6" />
														</svg>
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{totalPages > 1 && (
				<div className="ap-pagination">
					<button className="ap-pagination__nav" disabled={page === 1} onClick={() => setPage(page - 1)}>
						← Prev
					</button>
					<div className="ap-pagination__pages">
						{[...Array(totalPages)].map((_, i) => (
							<button
								key={i}
								className={`ap-pagination__page ${page === i + 1 ? 'ap-pagination__page--active' : ''}`}
								onClick={() => setPage(i + 1)}
							>
								{i + 1}
							</button>
						))}
					</div>
					<button className="ap-pagination__nav" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
						Next →
					</button>
				</div>
			)}

			{viewTarget && (
				<ArticleViewModal
					article={viewTarget}
					onClose={() => setViewTarget(null)}
					onUpdateStatus={handleUpdateStatus}
					onDelete={(id) => {
						setViewTarget(null);
						setDeleteTarget(id);
					}}
				/>
			)}
			{deleteTarget && <ConfirmDelete onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}
		</div>
	);
};

export default withAdminLayout(AdminArticles);
