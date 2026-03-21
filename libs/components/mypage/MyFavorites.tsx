import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Product } from '../../types/product/product';
import { T } from '../../types/common';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import ProductCard from '../common/ProductCard';
import { likeProductHandler } from '../../utils';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const PAGE_SIZE = 6;

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();

	const [myFavorites, setMyFavorites] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: PAGE_SIZE });

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	/** APOLLO **/
	useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMyFavorites(data?.getFavorites?.list ?? []);
			setTotal(data?.getFavorites?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (_: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	const totalPages = Math.ceil(total / PAGE_SIZE);

	// ── MOBILE ──────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div className="mp-favorites mp-favorites--mobile">
				<div className="mp-page-bar">
					<div className="mp-page-bar__left">
						<span className="mp-page-bar__eyebrow">Library</span>
						<h2 className="mp-page-bar__title">My Favorites</h2>
						<p className="mp-page-bar__sub">Products you've saved and loved</p>
					</div>
					{total > 0 && <span className="mp-favorites--mobile__mob-count">{total}</span>}
				</div>

				{myFavorites.length === 0 ? (
					<div className="mp-favorites__empty">
						<FavoriteBorderIcon sx={{ fontSize: 44 }} />
						<p>No favorites yet.</p>
						<span>Products you like will appear here.</span>
					</div>
				) : (
					<div className="mp-favorites__mob-list">
						{myFavorites.map((product: Product) => (
							<ProductCard
								key={product._id}
								product={product}
								listView={false}
								likeProductHandler={(user: any, id: string, isLiked: boolean) =>
									likeProductHandler(likeTargetProduct, user, id, isLiked)
								}
							/>
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="mp-favorites__pagination">
						<Pagination
							count={totalPages}
							page={searchFavorites.page}
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
		<div className="mp-favorites">
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					<span className="mp-page-bar__eyebrow">Library</span>
					<h2 className="mp-page-bar__title">My Favorites</h2>
					<p className="mp-page-bar__sub">Products you've saved and loved</p>
				</div>
				{total > 0 && (
					<div className="mp-page-bar__right">
						<div className="mp-page-bar__badge">
							<FavoriteIcon sx={{ fontSize: 14, color: '#e53935' }} />
							{total} saved
						</div>
					</div>
				)}
			</div>

			{myFavorites.length === 0 ? (
				<div className="mp-favorites__empty">
					<FavoriteBorderIcon sx={{ fontSize: 52 }} />
					<p>No favorites yet.</p>
					<span>Start liking products to build your collection.</span>
				</div>
			) : (
				<div className="mp-favorites__grid">
					{myFavorites.map((product: Product) => (
						<ProductCard
							key={product._id}
							product={product}
							listView={false}
							likeProductHandler={(user: any, id: string, isLiked: boolean) =>
								likeProductHandler(likeTargetProduct, user, id, isLiked)
							}
						/>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mp-favorites__pagination">
					<Pagination
						count={totalPages}
						page={searchFavorites.page}
						shape="rounded"
						color="primary"
						onChange={paginationHandler}
					/>
				</div>
			)}
		</div>
	);
};

export default MyFavorites;
