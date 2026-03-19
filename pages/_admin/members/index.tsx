import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { NEXT_PUBLIC_API_URL } from '../../../libs/config';
import { userVar } from '../../../apollo/store';
import { toastSmallSuccess, toastErrorHandling } from '../../../libs/toast';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';

const fd = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_META: Record<MemberStatus, { label: string; bg: string; color: string; dot: string }> = {
	[MemberStatus.ACTIVE]: { label: 'Active', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
	[MemberStatus.BLOCK]: { label: 'Blocked', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
	[MemberStatus.DELETE]: { label: 'Deleted', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
};

const TYPE_META: Record<MemberType, { label: string; bg: string; color: string }> = {
	[MemberType.USER]: { label: 'User', bg: '#f1f5f9', color: '#475569' },
	[MemberType.ADMIN]: { label: 'Admin', bg: '#ede9fe', color: '#6d28d9' },
};

const StatusChip = ({ status }: { status: MemberStatus }) => {
	const m = STATUS_META[status] ?? STATUS_META[MemberStatus.ACTIVE];
	return (
		<span className="ao-chip" style={{ background: m.bg, color: m.color }}>
			<span className="ao-chip__dot" style={{ background: m.dot }} />
			{m.label}
		</span>
	);
};

const TypeBadge = ({ type }: { type: MemberType }) => {
	const m = TYPE_META[type] ?? TYPE_META[MemberType.USER];
	return (
		<span className="am-type-badge" style={{ background: m.bg, color: m.color }}>
			{m.label}
		</span>
	);
};

const MemberDetailModal = ({
	member,
	onClose,
	onUpdateStatus,
	isSelf,
}: {
	member: any;
	onClose: () => void;
	onUpdateStatus: (id: string, s: MemberStatus) => void;
	isSelf: boolean;
}) => (
	<div className="admin-modal-overlay" onClick={onClose}>
		<div className="am-detail-modal" onClick={(e) => e.stopPropagation()}>
			<div className="am-detail-modal__header">
				<button className="am-detail-modal__close" onClick={onClose}>
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
			<div className="am-detail-modal__body">
				<div className="am-detail-modal__profile">
					<div className="am-detail-modal__avatar-wrap">
						{member.memberImage ? (
							<img
								src={`${NEXT_PUBLIC_API_URL}/${member.memberImage}`}
								alt={member.memberNick}
								className="am-detail-modal__avatar"
							/>
						) : (
							<div className="am-detail-modal__avatar am-detail-modal__avatar--placeholder">
								{member.memberNick?.[0]?.toUpperCase()}
							</div>
						)}
					</div>
					<div className="am-detail-modal__profile-info">
						<h3 className="am-detail-modal__nick">{member.memberNick}</h3>
						{member.memberFullName && <p className="am-detail-modal__fullname">{member.memberFullName}</p>}
						<div className="am-detail-modal__badges">
							<TypeBadge type={member.memberType} />
							<StatusChip status={member.memberStatus} />
						</div>
					</div>
				</div>

				<div className="am-detail-modal__section">
					<p className="am-detail-modal__section-title">Contact</p>
					<div className="am-detail-modal__info-grid">
						{[
							['Email', member.memberEmail],
							['Phone', member.memberPhone || '—'],
							['Address', member.memberAddress || '—'],
							['Auth Type', member.memberAuthType],
						].map(([l, v]) => (
							<div key={l} className="am-detail-modal__info-item">
								<span className="am-detail-modal__info-label">{l}</span>
								<span className="am-detail-modal__info-value">{v}</span>
							</div>
						))}
					</div>
				</div>

				<div className="am-detail-modal__section">
					<p className="am-detail-modal__section-title">Activity</p>
					<div className="am-detail-modal__stats-grid">
						{[
							['Points', member.memberPoints],
							['Articles', member.memberArticles],
							['Followers', member.memberFollowers],
							['Following', member.memberFollowings],
							['Likes', member.memberLikes],
							['Views', member.memberViews],
							['Comments', member.memberComments],
							['Rank', member.memberRank],
						].map(([l, v]) => (
							<div key={l} className="am-detail-modal__stat">
								<span className="am-detail-modal__stat-value">{v}</span>
								<span className="am-detail-modal__stat-label">{l}</span>
							</div>
						))}
					</div>
				</div>

				{(member.memberWarnings > 0 || member.memberBlocks > 0) && (
					<div className="am-detail-modal__flags">
						{member.memberWarnings > 0 && (
							<span className="am-detail-modal__flag am-detail-modal__flag--warn">
								⚠ {member.memberWarnings} warning{member.memberWarnings > 1 ? 's' : ''}
							</span>
						)}
						{member.memberBlocks > 0 && (
							<span className="am-detail-modal__flag am-detail-modal__flag--block">
								🚫 {member.memberBlocks} block{member.memberBlocks > 1 ? 's' : ''}
							</span>
						)}
					</div>
				)}

				<p className="am-detail-modal__joined">Member since {fd(member.createdAt)}</p>

				{!isSelf && member.memberType !== MemberType.ADMIN && (
					<div className="am-detail-modal__action">
						<p className="am-detail-modal__section-title">Change Status</p>
						<div className="am-detail-modal__status-btns">
							{Object.values(MemberStatus)
								.filter((s) => s !== MemberStatus.DELETE)
								.map((s) => (
									<button
										key={s}
										className={`am-detail-modal__status-btn ${
											member.memberStatus === s ? 'am-detail-modal__status-btn--active' : ''
										}`}
										style={
											member.memberStatus === s
												? {
														background: STATUS_META[s].bg,
														color: STATUS_META[s].color,
														borderColor: STATUS_META[s].dot,
												  }
												: {}
										}
										onClick={() => onUpdateStatus(member._id, s)}
									>
										{STATUS_META[s].label}
									</button>
								))}
						</div>
					</div>
				)}
				{isSelf && <p className="am-detail-modal__self-note">This is your account — status cannot be changed.</p>}
			</div>
		</div>
	</div>
);

const AdminMembers: NextPage = () => {
	const currentUser = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [members, setMembers] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<MemberStatus | ''>('');
	const [typeFilter, setTypeFilter] = useState<MemberType | ''>('');
	const [selectedMember, setSelectedMember] = useState<any | null>(null);
	const LIMIT = 10;

	const { data, loading, refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page,
				limit: LIMIT,
				search: {
					...(statusFilter && { memberStatus: statusFilter }),
					...(typeFilter && { memberType: typeFilter }),
					...(search && { text: search }),
				},
			},
		},
	});

	useEffect(() => {
		if (data) {
			setMembers(data?.getAllMembersByAdmin?.list ?? []);
			setTotal(data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0);
		}
	}, [data]);
	useEffect(() => {
		setPage(1);
	}, [statusFilter, typeFilter, search]);

	const [updateMember] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const handleUpdateStatus = async (id: string, memberStatus: MemberStatus) => {
		try {
			await updateMember({ variables: { input: { _id: id, memberStatus } } });
			toastSmallSuccess('Updated', 800);
			setMembers((p) => p.map((m) => (m._id === id ? { ...m, memberStatus } : m)));
			if (selectedMember?._id === id) setSelectedMember((p: any) => ({ ...p, memberStatus }));
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const filtered = members.filter(
		(m) =>
			search === '' ||
			m.memberNick?.toLowerCase().includes(search.toLowerCase()) ||
			m.memberEmail?.toLowerCase().includes(search.toLowerCase()) ||
			m.memberFullName?.toLowerCase().includes(search.toLowerCase()),
	);
	const totalPages = Math.ceil(total / LIMIT);

	return (
		<div className="admin-section">
			<div className="ap-page-header">
				<div>
					<h1 className="ap-page-header__title">Members</h1>
					<p className="ap-page-header__sub">
						Manage user accounts and permissions
						{total > 0 && <span className="ap-page-header__accent"> · {total} members</span>}
					</p>
				</div>
			</div>

			<div className="ap-toolbar">
				<div className="ap-search">
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input
						className="ap-search__input"
						type="text"
						placeholder="Search by nick, email or name..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					{search && (
						<button className="ap-search__clear" onClick={() => setSearch('')}>
							<svg
								width="13"
								height="13"
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
					)}
				</div>
				<div className="ap-toolbar__filters">
					<select
						className="ap-filter-select"
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value as MemberType | '')}
					>
						<option value="">All Types</option>
						{Object.values(MemberType).map((t) => (
							<option key={t} value={t}>
								{TYPE_META[t].label}
							</option>
						))}
					</select>
					<select
						className="ap-filter-select"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as MemberStatus | '')}
					>
						<option value="">All Statuses</option>
						{Object.values(MemberStatus).map((s) => (
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
									<th>Member</th>
									<th>Type</th>
									<th>Email</th>
									<th>Points</th>
									<th>Articles</th>
									<th>Followers</th>
									<th>Warnings</th>
									<th>Status</th>
									<th>Joined</th>
									<th style={{ textAlign: 'right' }}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{filtered.length === 0 ? (
									<tr>
										<td colSpan={10}>
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
														<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
														<circle cx="9" cy="7" r="4" />
														<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
														<path d="M16 3.13a4 4 0 0 1 0 7.75" />
													</svg>
												</div>
												<p className="ap-empty__title">No members found</p>
												<p className="ap-empty__sub">Try adjusting your search or filters</p>
											</div>
										</td>
									</tr>
								) : (
									filtered.map((m) => {
										const isSelf = m._id === currentUser?._id;
										return (
											<tr key={m._id} className="ap-table__row">
												<td>
													<div className="ap-product-cell">
														{m.memberImage ? (
															<img
																src={`${NEXT_PUBLIC_API_URL}/${m.memberImage}`}
																alt={m.memberNick}
																style={{
																	width: 40,
																	height: 40,
																	borderRadius: '50%',
																	objectFit: 'cover',
																	flexShrink: 0,
																	border: '1.5px solid #e2e8f0',
																}}
															/>
														) : (
															<div className="am-avatar-placeholder">{m.memberNick?.[0]?.toUpperCase()}</div>
														)}
														<div className="ap-product-cell__info">
															<span className="ap-product-cell__name">
																{m.memberNick}
																{isSelf && <span className="am-self-badge">You</span>}
															</span>
															<span className="ap-product-cell__brand">{m.memberFullName ?? m.memberEmail}</span>
														</div>
													</div>
												</td>
												<td>
													<TypeBadge type={m.memberType} />
												</td>
												<td>
													<span className="am-email-cell">{m.memberEmail}</span>
												</td>
												<td>
													<span className="ap-num-cell">{m.memberPoints}</span>
												</td>
												<td>
													<span className="ap-num-cell">{m.memberArticles}</span>
												</td>
												<td>
													<span className="ap-num-cell">{m.memberFollowers}</span>
												</td>
												<td>
													<span className={`ap-num-cell ${m.memberWarnings > 0 ? 'ap-num-cell--zero' : ''}`}>
														{m.memberWarnings}
													</span>
												</td>
												<td>
													{m.memberType === MemberType.ADMIN || isSelf ? (
														<StatusChip status={m.memberStatus} />
													) : (
														<div className="ao-select-wrap">
															<StatusChip status={m.memberStatus} />
															<select
																className="ao-select-overlay"
																value={m.memberStatus}
																onChange={(e) => handleUpdateStatus(m._id, e.target.value as MemberStatus)}
															>
																{Object.values(MemberStatus).map((s) => (
																	<option key={s} value={s}>
																		{STATUS_META[s].label}
																	</option>
																))}
															</select>
														</div>
													)}
												</td>
												<td>
													<span className="ap-date-cell">{fd(m.createdAt)}</span>
												</td>
												<td>
													<div className="ap-row-actions">
														<button className="ap-row-btn ap-row-btn--edit" onClick={() => setSelectedMember(m)}>
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
													</div>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{Math.ceil(total / LIMIT) > 1 && (
				<div className="ap-pagination">
					<button className="ap-pagination__nav" disabled={page === 1} onClick={() => setPage(page - 1)}>
						← Prev
					</button>
					<div className="ap-pagination__pages">
						{[...Array(Math.ceil(total / LIMIT))].map((_, i) => (
							<button
								key={i}
								className={`ap-pagination__page ${page === i + 1 ? 'ap-pagination__page--active' : ''}`}
								onClick={() => setPage(i + 1)}
							>
								{i + 1}
							</button>
						))}
					</div>
					<button
						className="ap-pagination__nav"
						disabled={page === Math.ceil(total / LIMIT)}
						onClick={() => setPage(page + 1)}
					>
						Next →
					</button>
				</div>
			)}

			{selectedMember && (
				<MemberDetailModal
					member={selectedMember}
					onClose={() => setSelectedMember(null)}
					onUpdateStatus={handleUpdateStatus}
					isSelf={selectedMember._id === currentUser?._id}
				/>
			)}
		</div>
	);
};

export default withAdminLayout(AdminMembers);
