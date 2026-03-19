import React from 'react';
import type { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	GET_ALL_MEMBERS_BY_ADMIN,
	GET_ALL_PRODUCTS_BY_ADMIN,
	GET_ALL_ORDERS_BY_ADMIN,
	GET_ALL_BOARD_ARTICLES_BY_ADMIN,
} from '../../../apollo/admin/query';

const Dashboard: NextPage = () => {
	const { data: md } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, { variables: { input: { page: 1, limit: 1, search: {} } } });
	const { data: pd } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, { variables: { input: { page: 1, limit: 1, search: {} } } });
	const { data: od } = useQuery(GET_ALL_ORDERS_BY_ADMIN, { variables: { input: { page: 1, limit: 1, search: {} } } });
	const { data: ad } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		variables: { input: { page: 1, limit: 1, search: {} } },
	});

	const stats = [
		{ label: 'Total Members', value: md?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0, accent: '#6366f1' },
		{ label: 'Total Products', value: pd?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0, accent: '#0ea5e9' },
		{ label: 'Total Orders', value: od?.getAllOrdersByAdmin?.metaCounter?.[0]?.total ?? 0, accent: '#f59e0b' },
		{ label: 'Total Articles', value: ad?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0, accent: '#10b981' },
	];

	return (
		<div className="admin-section">
			<div className="admin-section-header">
				<div>
					<h2 className="admin-section-header__title">Dashboard</h2>
					<p className="admin-section-header__sub">Welcome back — here's your store at a glance</p>
				</div>
			</div>

			<div className="admin-stats-grid">
				{stats.map((s) => (
					<div key={s.label} className="admin-stat-card" style={{ '--accent': s.accent } as React.CSSProperties}>
						<span className="admin-stat-card__value">{s.value.toLocaleString()}</span>
						<span className="admin-stat-card__label">{s.label}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default withAdminLayout(Dashboard);
