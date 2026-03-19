import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { NoticeCategory, NoticeStatus } from '../../../libs/enums/notice.enum';
import { toastSmallSuccess, toastErrorHandling } from '../../../libs/toast';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_NOTICES_BY_ADMIN } from '../../../apollo/admin/query';
import { CREATE_NOTICE_BY_ADMIN, UPDATE_NOTICE_BY_ADMIN } from '../../../apollo/admin/mutation';

const fd = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_META: Record<NoticeStatus, { label: string; bg: string; color: string; dot: string }> = {
	[NoticeStatus.ACTIVE]: { label: 'Active', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
	[NoticeStatus.HOLD]: { label: 'Hold', bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
	[NoticeStatus.DELETE]: { label: 'Deleted', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
};

const CATEGORY_META: Record<NoticeCategory, { label: string; bg: string; color: string }> = {
	[NoticeCategory.FAQ]: { label: 'FAQ', bg: '#dbeafe', color: '#1d4ed8' },
	[NoticeCategory.TERMS]: { label: 'Terms', bg: '#ede9fe', color: '#6d28d9' },
	[NoticeCategory.INQUIRY]: { label: 'Inquiry', bg: '#fef9c3', color: '#a16207' },
};

const StatusChip = ({ status }: { status: NoticeStatus }) => {
	const m = STATUS_META[status] ?? STATUS_META[NoticeStatus.HOLD];
	return (
		<span className="ao-chip" style={{ background: m.bg, color: m.color }}>
			<span className="ao-chip__dot" style={{ background: m.dot }} />
			{m.label}
		</span>
	);
};

const CategoryBadge = ({ category }: { category: NoticeCategory }) => {
	const m = CATEGORY_META[category] ?? CATEGORY_META[NoticeCategory.FAQ];
	return (
		<span className="am-type-badge" style={{ background: m.bg, color: m.color }}>
			{m.label}
		</span>
	);
};

const EMPTY_FORM = {
	noticeCategory: NoticeCategory.FAQ,
	noticeStatus: NoticeStatus.ACTIVE,
	noticeTitle: '',
	noticeContent: '',
};
type NoticeForm = typeof EMPTY_FORM;

const NoticeModal = ({
	initial,
	onClose,
	onSave,
	loading,
	mode,
}: {
	initial: NoticeForm;
	onClose: () => void;
	onSave: (f: NoticeForm) => void;
	loading: boolean;
	mode: 'create' | 'edit';
}) => {
	const [form, setForm] = useState<NoticeForm>(initial);
	const set = (key: keyof NoticeForm, val: any) => setForm((f) => ({ ...f, [key]: val }));

	return (
		<div className="admin-modal-overlay" onClick={onClose}>
			<div className="ap-modal" onClick={(e) => e.stopPropagation()}>
				<div className="ap-modal__header">
					<h3 className="ap-modal__title">{mode === 'create' ? 'Create Notice' : 'Edit Notice'}</h3>
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
				<div className="ap-modal__body">
					<div className="ap-form">
						<div className="ap-form__row">
							<div className="ap-form__field">
								<label className="ap-form__label">
									Category <span className="ap-form__req">*</span>
								</label>
								<select
									className="ap-form__select"
									value={form.noticeCategory}
									onChange={(e) => set('noticeCategory', e.target.value as NoticeCategory)}
								>
									{Object.values(NoticeCategory).map((c) => (
										<option key={c} value={c}>
											{CATEGORY_META[c].label}
										</option>
									))}
								</select>
							</div>
							<div className="ap-form__field">
								<label className="ap-form__label">Status</label>
								<select
									className="ap-form__select"
									value={form.noticeStatus}
									onChange={(e) => set('noticeStatus', e.target.value as NoticeStatus)}
								>
									{Object.values(NoticeStatus).map((s) => (
										<option key={s} value={s}>
											{STATUS_META[s].label}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="ap-form__field">
							<label className="ap-form__label">
								Title <span className="ap-form__req">*</span>
							</label>
							<input
								className="ap-form__input"
								value={form.noticeTitle}
								onChange={(e) => set('noticeTitle', e.target.value)}
								placeholder="Notice title..."
								maxLength={200}
							/>
						</div>
						<div className="ap-form__field">
							<label className="ap-form__label">
								Content <span className="ap-form__req">*</span>
							</label>
							<textarea
								className="ap-form__textarea"
								value={form.noticeContent}
								onChange={(e) => set('noticeContent', e.target.value)}
								rows={6}
								placeholder="Write the notice content here..."
							/>
							<span className="an-char-count">{form.noticeContent.length} characters</span>
						</div>
						<div className="ap-modal__footer">
							<button className="ap-btn ap-btn--ghost" onClick={onClose} disabled={loading}>
								Cancel
							</button>
							<button
								className="ap-btn ap-btn--primary"
								onClick={() => onSave(form)}
								disabled={loading || !form.noticeTitle.trim() || !form.noticeContent.trim()}
							>
								{loading ? <span className="ap-btn__spinner" /> : null}
								{loading ? 'Saving...' : mode === 'create' ? 'Create Notice' : 'Save Changes'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const NoticeViewModal = ({
	notice,
	onClose,
	onEdit,
	onDelete,
}: {
	notice: any;
	onClose: () => void;
	onEdit: () => void;
	onDelete: () => void;
}) => (
	<div className="admin-modal-overlay" onClick={onClose}>
		<div className="ap-modal" onClick={(e) => e.stopPropagation()}>
			<div className="ap-modal__header">
				<div>
					<div className="an-view-modal__meta">
						<CategoryBadge category={notice.noticeCategory} />
						<StatusChip status={notice.noticeStatus} />
					</div>
					<h3 className="ap-modal__title" style={{ marginTop: 8 }}>
						{notice.noticeTitle}
					</h3>
					<p className="ap-modal__subtitle">{fd(notice.createdAt)}</p>
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
			<div className="ap-modal__body">
				<div className="an-view-modal__content">{notice.noticeContent}</div>
				<div className="ap-modal__footer">
					<button className="ap-btn ap-btn--ghost" onClick={onDelete}>
						Delete
					</button>
					<button className="ap-btn ap-btn--primary" onClick={onEdit}>
						Edit
					</button>
				</div>
			</div>
		</div>
	</div>
);

const AdminNotices: NextPage = () => {
	const [page, setPage] = useState(1);
	const [notices, setNotices] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [categoryFilter, setCategoryFilter] = useState<NoticeCategory | ''>('');
	const [statusFilter, setStatusFilter] = useState<NoticeStatus | ''>('');
	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<any | null>(null);
	const [viewTarget, setViewTarget] = useState<any | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const LIMIT = 10;

	const { data, loading, refetch } = useQuery(GET_NOTICES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page,
				limit: LIMIT,
				search: {
					...(categoryFilter && { noticeCategory: categoryFilter }),
					...(statusFilter && { noticeStatus: statusFilter }),
				},
			},
		},
	});

	useEffect(() => {
		if (data) {
			setNotices(data?.getNoticesByAdmin?.list ?? []);
			setTotal(data?.getNoticesByAdmin?.metaCounter?.[0]?.total ?? 0);
		}
	}, [data]);
	useEffect(() => {
		setPage(1);
	}, [categoryFilter, statusFilter]);

	const [createNotice] = useMutation(CREATE_NOTICE_BY_ADMIN);
	const [updateNotice] = useMutation(UPDATE_NOTICE_BY_ADMIN);

	const handleCreate = async (form: NoticeForm) => {
		setSubmitting(true);
		try {
			await createNotice({
				variables: {
					input: {
						noticeCategory: form.noticeCategory,
						noticeStatus: form.noticeStatus,
						noticeTitle: form.noticeTitle.trim(),
						noticeContent: form.noticeContent.trim(),
					},
				},
			});
			toastSmallSuccess('Created!', 800);
			setCreateOpen(false);
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = async (form: NoticeForm) => {
		if (!editTarget) return;
		setSubmitting(true);
		try {
			const input: any = { _id: editTarget._id };
			if (form.noticeCategory !== editTarget.noticeCategory) input.noticeCategory = form.noticeCategory;
			if (form.noticeStatus !== editTarget.noticeStatus) input.noticeStatus = form.noticeStatus;
			if (form.noticeTitle.trim() !== editTarget.noticeTitle) input.noticeTitle = form.noticeTitle.trim();
			if (form.noticeContent.trim() !== editTarget.noticeContent) input.noticeContent = form.noticeContent.trim();
			await updateNotice({ variables: { input } });
			toastSmallSuccess('Updated!', 800);
			setEditTarget(null);
			setViewTarget(null);
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await updateNotice({ variables: { input: { _id: id, noticeStatus: NoticeStatus.DELETE } } });
			toastSmallSuccess('Deleted', 800);
			setViewTarget(null);
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const handleStatusChange = async (id: string, noticeStatus: NoticeStatus) => {
		try {
			await updateNotice({ variables: { input: { _id: id, noticeStatus } } });
			toastSmallSuccess('Updated', 800);
			setNotices((p) => p.map((n) => (n._id === id ? { ...n, noticeStatus } : n)));
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
					<h1 className="ap-page-header__title">Notices</h1>
					<p className="ap-page-header__sub">
						Manage FAQs, Terms & Conditions and Inquiries
						{total > 0 && <span className="ap-page-header__accent"> · {total} notices</span>}
					</p>
				</div>
				<button className="ap-btn ap-btn--primary ap-btn--md" onClick={() => setCreateOpen(true)}>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
					>
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					New Notice
				</button>
			</div>

			<div className="an-category-tabs">
				<button
					className={`an-category-tab ${categoryFilter === '' ? 'an-category-tab--active' : ''}`}
					onClick={() => setCategoryFilter('')}
				>
					All
				</button>
				{Object.values(NoticeCategory).map((c) => (
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
						onChange={(e) => setStatusFilter(e.target.value as NoticeStatus | '')}
					>
						<option value="">All Statuses</option>
						{Object.values(NoticeStatus).map((s) => (
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
									<th>Title</th>
									<th>Category</th>
									<th>Status</th>
									<th>Created</th>
									<th>Updated</th>
									<th style={{ textAlign: 'right' }}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{notices.length === 0 ? (
									<tr>
										<td colSpan={6}>
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
														<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
														<polyline points="14 2 14 8 20 8" />
														<line x1="16" y1="13" x2="8" y2="13" />
														<line x1="16" y1="17" x2="8" y2="17" />
													</svg>
												</div>
												<p className="ap-empty__title">No notices found</p>
												<p className="ap-empty__sub">Click "New Notice" to create your first one</p>
											</div>
										</td>
									</tr>
								) : (
									notices.map((n) => (
										<tr key={n._id} className="ap-table__row">
											<td>
												<p className="an-title-cell">{n.noticeTitle}</p>
												<p className="an-content-preview">{n.noticeContent}</p>
											</td>
											<td>
												<CategoryBadge category={n.noticeCategory} />
											</td>
											<td>
												<div className="ao-select-wrap">
													<StatusChip status={n.noticeStatus} />
													<select
														className="ao-select-overlay"
														value={n.noticeStatus}
														onChange={(e) => handleStatusChange(n._id, e.target.value as NoticeStatus)}
													>
														{Object.values(NoticeStatus).map((s) => (
															<option key={s} value={s}>
																{STATUS_META[s].label}
															</option>
														))}
													</select>
												</div>
											</td>
											<td>
												<span className="ap-date-cell">{fd(n.createdAt)}</span>
											</td>
											<td>
												<span className="ap-date-cell">{fd(n.updatedAt)}</span>
											</td>
											<td>
												<div className="ap-row-actions">
													<button className="ap-row-btn ap-row-btn--edit" onClick={() => setViewTarget(n)}>
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
													<button
														className="ap-row-btn ap-row-btn--edit"
														onClick={() => {
															setEditTarget(n);
															setViewTarget(null);
														}}
													>
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
															<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
															<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
														</svg>
														Edit
													</button>
													<button className="ap-row-btn ap-row-btn--delete" onClick={() => handleDelete(n._id)}>
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

			{createOpen && (
				<NoticeModal
					initial={{ ...EMPTY_FORM }}
					onClose={() => setCreateOpen(false)}
					onSave={handleCreate}
					loading={submitting}
					mode="create"
				/>
			)}
			{editTarget && (
				<NoticeModal
					initial={{
						noticeCategory: editTarget.noticeCategory,
						noticeStatus: editTarget.noticeStatus,
						noticeTitle: editTarget.noticeTitle,
						noticeContent: editTarget.noticeContent,
					}}
					onClose={() => setEditTarget(null)}
					onSave={handleEdit}
					loading={submitting}
					mode="edit"
				/>
			)}
			{viewTarget && !editTarget && (
				<NoticeViewModal
					notice={viewTarget}
					onClose={() => setViewTarget(null)}
					onEdit={() => {
						setEditTarget(viewTarget);
						setViewTarget(null);
					}}
					onDelete={() => handleDelete(viewTarget._id)}
				/>
			)}
		</div>
	);
};

export default withAdminLayout(AdminNotices);
