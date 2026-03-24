import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Button, Drawer, Menu, MenuItem, Pagination, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductFilter from '../../libs/components/product/Filter';
import ProductCard from '../../libs/components/common/ProductCard';
import { useRouter } from 'next/router';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Product } from '../../libs/types/product/product';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDown';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { toastErrorHandling, toastLoginConfirm, toastSmallSuccess } from '../../libs/toast';
import { userVar } from '../../apollo/store';
import { ProductDressStyle, ProductSize, ProductCategory } from '../../libs/enums/product.enum';
import PolicyBanner from '../../libs/components/product/PolicyBanner';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductList: NextPage = ({ initialInput }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(initialInput);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('Newest');
	const [gridView, setGridView] = useState<'grid' | 'list'>('grid'); // desktop only
	const [drawerOpen, setDrawerOpen] = useState(false); // mobile only

	/** APOLLO **/
	const {
		loading: getProductsLoading,
		refetch: getProductsRefetch,
		data: productsData,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
	});

	useEffect(() => {
		if (productsData) {
			setProducts(productsData?.getProducts?.list ?? []);
			setTotal(productsData?.getProducts?.metaCounter[0]?.total ?? 0);
		}
	}, [productsData]);

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	/** BUILD URL QUERY **/
	const buildQuery = (filter: ProductsInquiry) => ({
		page: filter.page,
		limit: filter.limit,
		sort: filter.sort,
		direction: filter.direction,
		text: filter.search?.text,
		priceStart: filter.search?.pricesRange?.start,
		priceEnd: filter.search?.pricesRange?.end,
		category: filter.search?.categoryList,
		size: filter.search?.sizeList,
		color: filter.search?.colorList,
		dressStyle: filter.search?.dressStyleList,
		brand: filter.search?.brandList,
	});

	/** UPDATE FILTER **/
	const updateFilter = async (filter: ProductsInquiry) => {
		await router.replace({ pathname: '/product', query: buildQuery(filter) }, undefined, { shallow: true });
	};

	/** URL → FILTER SYNC **/
	useEffect(() => {
		if (!router.isReady) return;

		const query = router.query;
		const rebuiltFilter: ProductsInquiry = {
			page: Number(query.page) || 1,
			limit: Number(query.limit) || 12,
			sort: (query.sort as string) || 'createdAt',
			direction: (query.direction as unknown as Direction) || Direction.DESC,
			search: {
				text: (query.text as string) || '',
				pricesRange: {
					start: Number(query.priceStart) || 0,
					end: Number(query.priceEnd) || 500000,
				},
				categoryList: query.category
					? ((Array.isArray(query.category) ? query.category : [query.category]) as ProductCategory[])
					: [],
				sizeList: query.size ? ((Array.isArray(query.size) ? query.size : [query.size]) as ProductSize[]) : [],
				colorList: query.color ? (Array.isArray(query.color) ? query.color : [query.color]) : [],
				dressStyleList: query.dressStyle
					? ((Array.isArray(query.dressStyle) ? query.dressStyle : [query.dressStyle]) as ProductDressStyle[])
					: [],
				brandList: query.brand ? (Array.isArray(query.brand) ? query.brand : [query.brand]) : [],
			},
		};

		setSearchFilter((prev) => {
			if (JSON.stringify(prev) === JSON.stringify(rebuiltFilter)) return prev;
			return rebuiltFilter;
		});
		setCurrentPage(rebuiltFilter.page);
	}, [router.isReady, router.query]);

	/** LIKE **/
	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!user?._id) {
				const ok = await toastLoginConfirm('Please log in to like this product');
				if (ok) {
					router.push({ pathname: router.pathname, query: { ...router.query, auth: 'login' } }, undefined, {
						shallow: true,
					});
				}
				return;
			}

			await likeTargetProduct({ variables: { input: id } });
			toastSmallSuccess('Success', 800);
			await getProductsRefetch({ input: searchFilter });
		} catch (err: any) {
			toastErrorHandling(err.message);
		}
	};

	/** PAGINATION **/
	const handlePaginationChange = async (_: ChangeEvent<unknown>, value: number) => {
		const updated = { ...searchFilter, page: value };
		setCurrentPage(value);
		await updateFilter(updated);
		if (device === 'mobile') window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	/** SORT **/
	const sortingHandler = async (e: React.MouseEvent<HTMLLIElement>) => {
		let updated = { ...searchFilter };
		switch (e.currentTarget.id) {
			case 'newest':
				updated = { ...updated, sort: 'createdAt', direction: Direction.DESC };
				setFilterSortName('Newest');
				break;
			case 'lowest':
				updated = { ...updated, sort: 'productPrice', direction: Direction.ASC };
				setFilterSortName('Low to High');
				break;
			case 'highest':
				updated = { ...updated, sort: 'productPrice', direction: Direction.DESC };
				setFilterSortName('High to Low');
				break;
			case 'popular':
				updated = { ...updated, sort: 'productLikes', direction: Direction.DESC };
				setFilterSortName('Popular');
				break;
		}
		await updateFilter(updated);
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const activeFilterCount =
		(searchFilter.search?.text ? 1 : 0) +
		(searchFilter.search?.categoryList?.length ?? 0) +
		(searchFilter.search?.sizeList?.length ?? 0) +
		(searchFilter.search?.colorList?.length ?? 0) +
		(searchFilter.search?.dressStyleList?.length ?? 0) +
		(searchFilter.search?.brandList?.length ?? 0);

	const SortMenu = () => (
		<Menu
			anchorEl={anchorEl}
			open={sortingOpen}
			onClose={() => {
				setSortingOpen(false);
				setAnchorEl(null);
			}}
			sx={{ mt: '4px' }}
		>
			<MenuItem id="newest" onClick={sortingHandler} disableRipple>
				Newest
			</MenuItem>
			<MenuItem id="lowest" onClick={sortingHandler} disableRipple>
				Price: Low to High
			</MenuItem>
			<MenuItem id="highest" onClick={sortingHandler} disableRipple>
				Price: High to Low
			</MenuItem>
			<MenuItem id="popular" onClick={sortingHandler} disableRipple>
				Most Popular
			</MenuItem>
		</Menu>
	);

	// ─── MOBILE ───────────────────────────────────────────────────────────────
	if (device === 'mobile') {
		return (
			<div id="product-list-page">
				{/* Sticky top bar: count | sort + filter */}
				<div className="mobile-topbar">
					<span className="product-page__count">
						{total} {total === 1 ? 'product' : 'products'}
					</span>

					<div className="mobile-topbar__actions">
						<Button
							className="product-page__sort-btn"
							onClick={(e) => {
								setAnchorEl(e.currentTarget);
								setSortingOpen(true);
							}}
							endIcon={<KeyboardArrowDownRoundedIcon fontSize="small" />}
						>
							{filterSortName}
						</Button>
						<SortMenu />

						<button className="mobile-filter-btn" onClick={() => setDrawerOpen(true)}>
							<TuneRoundedIcon fontSize="small" />
							<span>Filter</span>
							{activeFilterCount > 0 && <span className="mobile-filter-btn__badge">{activeFilterCount}</span>}
						</button>
					</div>
				</div>

				{/* Products — always grid on mobile */}
				<div className="mobile-content">
					{products.length === 0 && !getProductsLoading ? (
						<div className="product-page__empty">
							<p>No products found</p>
							<span>
								Use fewer filters or{' '}
								<button className="product-page__empty-clear" onClick={() => updateFilter(initialInput)}>
									clear all
								</button>
							</span>
						</div>
					) : (
						<div className="product-page__grid-wrap">
							{getProductsLoading && <div className="product-page__grid-overlay" />}
							<div
								className={`product-page__grid product-page__grid--grid${
									getProductsLoading ? ' product-page__grid--loading' : ''
								}`}
							>
								{products.map((product: Product) => (
									<ProductCard
										key={product._id}
										product={product}
										likeProductHandler={likeProductHandler}
										listView={false}
									/>
								))}
							</div>
						</div>
					)}

					{products.length > 0 && (
						<div className="product-page__pagination">
							<Typography className="product-page__showing">
								Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
							</Typography>
							<Pagination
								page={currentPage}
								count={Math.ceil(total / searchFilter.limit)}
								onChange={handlePaginationChange}
								shape="rounded"
								color="primary"
								siblingCount={1}
								boundaryCount={1}
							/>
						</div>
					)}

					<PolicyBanner />
				</div>

				{/* Bottom-sheet filter drawer */}
				<Drawer
					anchor="bottom"
					open={drawerOpen}
					onClose={() => setDrawerOpen(false)}
					classes={{ paper: 'mobile-filter-drawer' }}
				>
					<div className="mobile-filter-drawer__header">
						<span className="mobile-filter-drawer__title">Filters</span>
						<button className="mobile-filter-drawer__close" onClick={() => setDrawerOpen(false)}>
							<CloseRoundedIcon />
						</button>
					</div>

					<div className="mobile-filter-drawer__body">
						<ProductFilter
							searchFilter={searchFilter}
							setSearchFilter={updateFilter}
							initialInput={initialInput}
							onSearch={() => setDrawerOpen(false)}
						/>
					</div>

					<div className="mobile-filter-drawer__footer">
						<button className="mobile-filter-drawer__apply" onClick={() => setDrawerOpen(false)}>
							Show {total} {total === 1 ? 'result' : 'results'}
						</button>
					</div>
				</Drawer>
			</div>
		);
	}

	// ─── DESKTOP ──────────────────────────────────────────────────────────────
	return (
		<div id="product-list-page">
			<div className="container">
				<div className="product-page__layout">
					<aside className="product-page__sidebar">
						<ProductFilter searchFilter={searchFilter} setSearchFilter={updateFilter} initialInput={initialInput} />
					</aside>

					<main className="product-page__main">
						<div className="product-page__toolbar">
							<span className="product-page__count">
								{total} {total === 1 ? 'product' : 'products'}
							</span>

							<div className="product-page__toolbar-right">
								<div className="product-page__view-toggle">
									<button
										className={`product-page__view-btn${gridView === 'grid' ? ' product-page__view-btn--active' : ''}`}
										onClick={() => setGridView('grid')}
										aria-label="Grid view"
									>
										<GridViewRoundedIcon fontSize="small" />
									</button>
									<button
										className={`product-page__view-btn${gridView === 'list' ? ' product-page__view-btn--active' : ''}`}
										onClick={() => setGridView('list')}
										aria-label="List view"
									>
										<ViewListRoundedIcon fontSize="small" />
									</button>
								</div>

								<div className="product-page__sort">
									<span className="product-page__sort-label">Sort:</span>
									<Button
										className="product-page__sort-btn"
										onClick={(e) => {
											setAnchorEl(e.currentTarget);
											setSortingOpen(true);
										}}
										endIcon={<KeyboardArrowDownRoundedIcon />}
									>
										{filterSortName}
									</Button>
									<SortMenu />
								</div>
							</div>
						</div>

						{products.length === 0 && !getProductsLoading ? (
							<div className="product-page__empty">
								<p>No products found</p>
								<span>
									Use fewer filters or{' '}
									<button className="product-page__empty-clear" onClick={() => updateFilter(initialInput)}>
										clear all
									</button>
								</span>
							</div>
						) : (
							<div className="product-page__grid-wrap">
								{getProductsLoading && <div className="product-page__grid-overlay" />}
								<div
									className={`product-page__grid product-page__grid--${gridView}${
										getProductsLoading ? ' product-page__grid--loading' : ''
									}`}
								>
									{products.map((product: Product) => (
										<ProductCard
											key={product._id}
											product={product}
											likeProductHandler={likeProductHandler}
											listView={gridView === 'list'}
										/>
									))}
								</div>
							</div>
						)}

						{products.length > 0 && (
							<div className="product-page__pagination">
								<Typography className="product-page__showing">
									Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
								</Typography>
								<Pagination
									page={currentPage}
									count={Math.ceil(total / searchFilter.limit)}
									onChange={handlePaginationChange}
									shape="rounded"
									color="primary"
								/>
							</div>
						)}
					</main>
				</div>
				<PolicyBanner />
			</div>
		</div>
	);
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
				end: 500000,
			},
		},
	},
};

export default withLayoutBasic(ProductList);
