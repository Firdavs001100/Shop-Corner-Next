import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import { NEXT_PUBLIC_API_URL } from '../../config';
import Head from 'next/head';

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconGrid = () => (
	<svg
		width="17"
		height="17"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="3" y="3" width="7" height="7" />
		<rect x="14" y="3" width="7" height="7" />
		<rect x="14" y="14" width="7" height="7" />
		<rect x="3" y="14" width="7" height="7" />
	</svg>
);
const IconBox = () => (
	<svg
		width="17"
		height="17"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
	</svg>
);
const IconShoppingBag = () => (
	<svg
		width="17"
		height="17"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
		<line x1="3" y1="6" x2="21" y2="6" />
		<path d="M16 10a4 4 0 0 1-8 0" />
	</svg>
);
const IconUsers = () => (
	<svg
		width="17"
		height="17"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
		<path d="M16 3.13a4 4 0 0 1 0 7.75" />
	</svg>
);
const IconFileText = () => (
	<svg
		width="17"
		height="17"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
		<polyline points="14 2 14 8 20 8" />
		<line x1="16" y1="13" x2="8" y2="13" />
		<line x1="16" y1="17" x2="8" y2="17" />
	</svg>
);
const IconMessageSquare = () => (
	<svg
		width="17"
		height="17"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
	</svg>
);
const IconLogOut = () => (
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
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<polyline points="16 17 21 12 16 7" />
		<line x1="21" y1="12" x2="9" y2="12" />
	</svg>
);
const IconHome = () => (
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
		<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
		<polyline points="9 22 9 12 15 12 15 22" />
	</svg>
);

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
	{ key: 'dashboard', label: 'Dashboard', icon: <IconGrid />, path: '/_admin/dashboard' },
	{ key: 'products', label: 'Products', icon: <IconBox />, path: '/_admin/products' },
	{ key: 'orders', label: 'Orders', icon: <IconShoppingBag />, path: '/_admin/orders' },
	{ key: 'members', label: 'Members', icon: <IconUsers />, path: '/_admin/members' },
	{ key: 'cs', label: 'Cs', icon: <IconFileText />, path: '/_admin/cs' },
	{ key: 'community', label: 'Community', icon: <IconMessageSquare />, path: '/_admin/community' },
];

// ── HOC ───────────────────────────────────────────────────────────────────────

const withAdminLayout = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);

		useEffect(() => {
			if (user?._id && user.memberType !== MemberType.ADMIN) {
				router.replace('/');
			}
		}, [user]);

		const activeKey = NAV_ITEMS.find((n) => router.pathname.startsWith(n.path))?.key ?? 'dashboard';

		return (
			<>
				<Head>
					<title>ShopCo — Admin</title>
				</Head>

				<div id="pc-wrap">
					<div className="admin-layout">
						{/* ── Sidebar ── */}
						<aside className="admin-sidebar">
							<div className="admin-sidebar__brand">
								<span className="admin-sidebar__brand-logo">SHOP.CO</span>
								<span className="admin-sidebar__brand-tag">Admin</span>
							</div>

							<nav className="admin-sidebar__nav">
								{NAV_ITEMS.map((item) => (
									<button
										key={item.key}
										className={`admin-sidebar__nav-item ${
											activeKey === item.key ? 'admin-sidebar__nav-item--active' : ''
										}`}
										onClick={() => router.push(item.path)}
									>
										<span className="admin-sidebar__nav-icon">{item.icon}</span>
										<span>{item.label}</span>
									</button>
								))}
							</nav>

							<div className="admin-sidebar__footer">
								<div className="admin-sidebar__user">
									{user?.memberImage ? (
										<img
											src={`${NEXT_PUBLIC_API_URL}/${user.memberImage}`}
											alt={user.memberNick}
											className="admin-sidebar__user-avatar"
										/>
									) : (
										<div className="admin-sidebar__user-avatar admin-sidebar__user-avatar--placeholder">
											{user?.memberNick?.[0]?.toUpperCase() ?? 'A'}
										</div>
									)}
									<div className="admin-sidebar__user-info">
										<span className="admin-sidebar__user-nick">{user?.memberNick ?? 'Admin'}</span>
										<span className="admin-sidebar__user-role">Administrator</span>
									</div>
								</div>

								<div className="admin-sidebar__footer-actions">
									<button className="admin-sidebar__footer-btn" onClick={() => router.push('/')}>
										<IconHome />
										<span>Site</span>
									</button>
									<button
										className="admin-sidebar__footer-btn admin-sidebar__footer-btn--danger"
										onClick={() => router.push('/')}
									>
										<IconLogOut />
										<span>Exit</span>
									</button>
								</div>
							</div>
						</aside>

						{/* ── Main ── */}
						<main className="admin-main">
							<Component {...props} />
						</main>
					</div>
				</div>
			</>
		);
	};
};

export default withAdminLayout;
