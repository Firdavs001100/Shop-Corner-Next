import { useState, useRef, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';

import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';

import { toastErrorHandling, toastLoginConfirm, toastSmallSuccess } from '../../toast';
import ProductCard from '../common/ProductCard';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface BestSellersProps {
	initialInput: ProductsInquiry;
}

const CARD_GAP = 20;

const BestSellers = ({ initialInput }: BestSellersProps) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [products, setProducts] = useState<Product[]>([]);
	const [slideIndex, setSlideIndex] = useState(0);
	const slideRef = useRef<HTMLDivElement>(null);

	const isMobile = device === 'mobile';
	const visibleCards = isMobile ? 1 : 2;

	const {
		loading: getProductsLoading,
		data: getProductsData,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
	});

	useEffect(() => {
		if (getProductsData?.getProducts?.list) {
			setProducts(getProductsData.getProducts.list);
		}
	}, [getProductsData]);

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

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
			await getProductsRefetch({ input: initialInput });
			toastSmallSuccess('Success', 800);
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const getStepPx = () => {
		if (!slideRef.current) return 0;
		const firstSlide = slideRef.current.firstElementChild as HTMLElement;
		if (!firstSlide) return 0;
		return firstSlide.offsetWidth + CARD_GAP;
	};

	const next = () => {
		setSlideIndex((prev) => {
			if (prev + visibleCards >= products.length) return 0;
			return prev + 1;
		});
	};

	const prev = () => {
		setSlideIndex((prev) => {
			if (prev === 0) return Math.max(products.length - visibleCards, 0);
			return prev - 1;
		});
	};

	const translateX = isMobile
		? `translateX(${-slideIndex * getStepPx()}px)`
		: `translateX(calc(-${slideIndex} * (${100 / visibleCards}% + ${CARD_GAP}px)))`;

	const leftContent = (
		<Box className="best-sellers__left">
			<img src="/img/banner/bs9.jpg" alt="Best Sellers" className="best-sellers__hero-img" />
		</Box>
	);

	const rightContent = (
		<Box className="best-sellers__right">
			<Box className="best-sellers__header">
				<Typography className="best-sellers__title">Best Sellers</Typography>
				<Typography className="best-sellers__desc">
					Discover the products our customers love the most. Tried, trusted, and chosen again and again.
				</Typography>
				<button className="best-sellers__view-all" onClick={() => router.push('/product')}>
					View All Collection
					<ArrowForwardIcon sx={{ fontSize: 16 }} />
				</button>
			</Box>

			{getProductsLoading ? (
				<Box className="best-sellers__loading">
					<CircularProgress size={32} />
				</Box>
			) : products.length === 0 ? (
				<Box className="best-sellers__empty">
					<Box className="empty-content">
						<img src="/img/icons/icoAlert.svg" alt="empty" className="empty-icon" />
						<Typography className="empty-title">No Products Found</Typography>
						<Typography className="empty-desc">There are no best-selling products available at the moment.</Typography>
					</Box>
				</Box>
			) : (
				<Box className="best-sellers__slider-wrap">
					<Box
						ref={slideRef}
						className="best-sellers__slider"
						style={{
							transform: translateX,
							transition: 'transform .45s cubic-bezier(.25,.8,.25,1)',
						}}
					>
						{products.map((product) => (
							<Box className="best-sellers__slide" key={product._id}>
								<ProductCard product={product} likeProductHandler={likeProductHandler} variant="slider" />
							</Box>
						))}
					</Box>

					<Box className="best-sellers__nav">
						<button className="best-sellers__nav-btn" onClick={prev}>
							<ChevronLeftIcon />
						</button>
						<button className="best-sellers__nav-btn" onClick={next}>
							<ChevronRightIcon />
						</button>
					</Box>
				</Box>
			)}
		</Box>
	);

	if (isMobile) {
		return (
			<Box className="best-sellers">
				<div className="container">
					{leftContent}
					{rightContent}
				</div>
			</Box>
		);
	} else {
		return (
			<Box className="best-sellers">
				<div className="container">
					{leftContent}
					{rightContent}
				</div>
			</Box>
		);
	}
};

BestSellers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 4,
		sort: 'productSales',
		direction: 'DESC',
		search: {},
	},
};

export default BestSellers;
