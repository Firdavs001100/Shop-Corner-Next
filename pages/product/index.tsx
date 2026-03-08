import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductFilter from '../../libs/components/product/Filter';
import ProductCard from '../../libs/components/common/ProductCard';
import { useRouter } from 'next/router';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Product } from '../../libs/types/product/product';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { toastErrorHandling, toastSmallSuccess } from '../../libs/toast';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('Newest');
	const [gridView, setGridView] = useState<'grid' | 'list'>('grid');

	/** APOLLO REQUESTS **/
	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}
		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	/** HANDLERS **/
	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProduct({ variables: { input: id } });
			await getProductsRefetch({ input: searchFilter });
			toastSmallSuccess('Success', 800);
		} catch (err: any) {
			toastErrorHandling(err.message);
		}
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/product?input=${JSON.stringify(searchFilter)}`,
			`/product?input=${JSON.stringify(searchFilter)}`,
			{ scroll: false },
		);
		setCurrentPage(value);
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'newest':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.DESC });
				setFilterSortName('Newest');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'productPrice', direction: Direction.ASC });
				setFilterSortName('Price: Low to High');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'productPrice', direction: Direction.DESC });
				setFilterSortName('Price: High to Low');
				break;
			case 'popular':
				setSearchFilter({ ...searchFilter, sort: 'productLikes', direction: Direction.DESC });
				setFilterSortName('Most Popular');
				break;
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <h1>PRODUCTS MOBILE</h1>;
	} else {
		return (
			<div id="product-list-page">
				<div className="container">
					<div className="product-page__layout">
						{/* FILTER SIDEBAR */}
						<aside className="product-page__sidebar">
							<ProductFilter
								searchFilter={searchFilter}
								setSearchFilter={setSearchFilter}
								initialInput={initialInput}
							/>
						</aside>

						{/* MAIN CONTENT */}
						<main className="product-page__main">
							{/* TOOLBAR */}
							<div className="product-page__toolbar">
								<span className="product-page__count">
									{total} {total === 1 ? 'item' : 'items'}
								</span>

								<div className="product-page__toolbar-right">
									{/* View toggle */}
									<div className="product-page__view-toggle">
										<button
											className={`product-page__view-btn${
												gridView === 'grid' ? ' product-page__view-btn--active' : ''
											}`}
											onClick={() => setGridView('grid')}
											aria-label="Grid view"
										>
											<GridViewRoundedIcon fontSize="small" />
										</button>
										<button
											className={`product-page__view-btn${
												gridView === 'list' ? ' product-page__view-btn--active' : ''
											}`}
											onClick={() => setGridView('list')}
											aria-label="List view"
										>
											<ViewListRoundedIcon fontSize="small" />
										</button>
									</div>

									{/* Sort */}
									<div className="product-page__sort">
										<span className="product-page__sort-label">Sort:</span>
										<Button
											className="product-page__sort-btn"
											onClick={sortingClickHandler}
											endIcon={<KeyboardArrowDownRoundedIcon />}
										>
											{filterSortName}
										</Button>
										<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ mt: '4px' }}>
											<MenuItem onClick={sortingHandler} id="newest" disableRipple>
												Newest
											</MenuItem>
											<MenuItem onClick={sortingHandler} id="lowest" disableRipple>
												Price: Low to High
											</MenuItem>
											<MenuItem onClick={sortingHandler} id="highest" disableRipple>
												Price: High to Low
											</MenuItem>
											<MenuItem onClick={sortingHandler} id="popular" disableRipple>
												Most Popular
											</MenuItem>
										</Menu>
									</div>
								</div>
							</div>

							{/* PRODUCT GRID */}
							{getProductsLoading ? (
								<div className="product-page__loading">
									{[...Array(9)].map((_, i) => (
										<div key={i} className="product-page__skeleton" />
									))}
								</div>
							) : products.length === 0 ? (
								<div className="product-page__empty">
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No products found</p>
									<span>Try adjusting your filters</span>
								</div>
							) : (
								<div className={`product-page__grid product-page__grid--${gridView}`}>
									{products.map((product: Product) => (
										<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
									))}
								</div>
							)}

							{/* PAGINATION */}
							{products.length > 0 && (
								<div className="product-page__pagination">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / searchFilter.limit)}
										onChange={handlePaginationChange}
										shape="circular"
										color="primary"
									/>
									<Typography className="product-page__total">
										Total {total} product{total !== 1 ? 's' : ''}
									</Typography>
								</div>
							)}
						</main>
					</div>
				</div>
			</div>
		);
	}
};

ProductList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			pricesRange: {
				start: 0,
				end: 5000000,
			},
		},
	},
};

export default withLayoutBasic(ProductList);
