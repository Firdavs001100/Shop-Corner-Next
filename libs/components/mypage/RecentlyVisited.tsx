import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import ProductCard from '../common/ProductCard';
import HistoryIcon from '@mui/icons-material/History';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Product } from '../../types/product/product';
import { T } from '../../types/common';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { GET_VISITED } from '../../../apollo/user/query';
import { likeProductHandler } from '../../utils';

const PAGE_SIZE = 6;

const RecentlyVisited: NextPage = () => {
	const device = useDeviceDetect();

	const [recentlyVisited, setRecentlyVisited] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: PAGE_SIZE });

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	/** APOLLO **/
	useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setRecentlyVisited(data?.getVisited?.list ?? []);
			setTotal(data?.getVisited?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (_: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	const totalPages = Math.ceil(total / PAGE_SIZE);

	// ── MOBILE ──────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div className="mp-recently-visited mp-recently-visited--mobile">
				<div className="mp-recently-visited__mob-header">
					<div className="mp-recently-visited__mob-header-left">
						<HistoryIcon sx={{ fontSize: 20, color: '#0f2035' }} />
						<h2 className="mp-recently-visited__mob-title">Recently Visited</h2>
					</div>
					<span className="mp-recently-visited__mob-count">{total}</span>
				</div>

				{recentlyVisited.length === 0 ? (
					<div className="mp-recently-visited__empty">
						<RemoveRedEyeOutlinedIcon sx={{ fontSize: 44 }} />
						<p>No recently visited products yet.</p>
						<span>Products you view will appear here.</span>
					</div>
				) : (
					<div className="mp-recently-visited__mob-list">
						{recentlyVisited.map((product: Product) => (
							<ProductCard
								key={product._id}
								product={product}
								listView={false}
								likeProductHandler={(user: any, id: any, isLiked: any) => likeProductHandler(likeTargetProduct, user, id, isLiked)}
							/>
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="mp-recently-visited__pagination">
						<Pagination
							count={totalPages}
							page={searchVisited.page}
							shape="rounded"
							color="primary"
							size="small"
							onChange={paginationHandler}
						/>
					</div>
				)}
			</div>
		);
	}

	// ── DESKTOP ──────────────────────────────────────────────────────────────

	return (
		<div className="mp-recently-visited">
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					<span className="mp-page-bar__eyebrow">History</span>
					<h2 className="mp-page-bar__title">Recently Visited</h2>
					<p className="mp-page-bar__sub">Products you've checked out</p>
				</div>
				{total > 0 && (
					<span className="mp-recently-visited__total-badge">
						<HistoryIcon sx={{ fontSize: 14, color: '#0f2035' }} />
						{total} viewed
					</span>
				)}
			</div>

			{recentlyVisited.length === 0 ? (
				<div className="mp-recently-visited__empty">
					<RemoveRedEyeOutlinedIcon sx={{ fontSize: 52 }} />
					<p>No recently visited products yet.</p>
					<span>Start browsing products to see your history here.</span>
				</div>
			) : (
				<div className="mp-recently-visited__grid">
					{recentlyVisited.map((product: Product) => (
						<ProductCard
							key={product._id}
							product={product}
							listView={false}
							likeProductHandler={(user: any, id: any, isLiked: any) => likeProductHandler(likeTargetProduct, user, id, isLiked)}
						/>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mp-recently-visited__pagination">
					<Pagination
						count={totalPages}
						page={searchVisited.page}
						shape="rounded"
						color="primary"
						onChange={paginationHandler}
					/>
				</div>
			)}
		</div>
	);
};

export default RecentlyVisited;
