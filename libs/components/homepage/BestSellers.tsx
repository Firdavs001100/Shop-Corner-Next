import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
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

import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import ProductCard from './ProductCard';

interface BestSellersProps {
	initialInput: ProductsInquiry;
}

const BestSellers = ({ initialInput }: BestSellersProps) => {
	const router = useRouter();
	const [products, setProducts] = useState<Product[]>([]);
	const [slideIndex, setSlideIndex] = useState(0);

	const visibleCards = 2.5;
	const cardWidth = 100 / visibleCards;

	const { loading: getProductsLoading, refetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		onCompleted: (data: T) => setProducts(data?.getProducts?.list || []),
	});

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProduct({ variables: { input: id } });
			await refetch({ input: initialInput });
			toastSmallSuccess('Success', 800);
		} catch (err: any) {
			toastErrorHandling(err.message);
		}
	};

	// Infinite scroll logic without cloning
	const next = () => setSlideIndex((prev) => (prev + 1) % products.length);
	const prev = () => setSlideIndex((prev) => (prev - 1 + products.length) % products.length);

	return (
		<Box className="best-sellers">
			<div className="best-sellers__left">
				<img src="/img/banner/ps2.avif" alt="Best Sellers" className="best-sellers__hero-img" />
			</div>

			<div className="best-sellers__right">
				<div className="best-sellers__header">
					<h2 className="best-sellers__title">Best Sellers</h2>
					<p className="best-sellers__desc">
						Pair text with an image to focus on your chosen product, collection, or blog post.
					</p>
					<button className="best-sellers__view-all" onClick={() => router.push('/product')}>
						View All Collection
						<ArrowForwardIcon sx={{ fontSize: 16 }} />
					</button>
				</div>

				{getProductsLoading ? (
					<Box className="best-sellers__loading">
						<CircularProgress size={32} />
					</Box>
				) : (
					<div className="best-sellers__slider-wrap">
						<div
							className="best-sellers__slider"
							style={{
								transform: `translateX(calc(-${slideIndex * cardWidth}% - ${slideIndex * 20}px))`,
								transition: 'transform .45s cubic-bezier(.25,.8,.25,1)',
							}}
						>
							{products.map((product, idx) => (
								<div className="best-sellers__slide" key={product._id}>
									<ProductCard product={product} likeProductHandler={likeProductHandler} variant="slider" />
								</div>
							))}
						</div>

						<div className="best-sellers__nav">
							<button className="best-sellers__nav-btn" onClick={prev}>
								<ChevronLeftIcon />
							</button>

							<button className="best-sellers__nav-btn" onClick={next}>
								<ChevronRightIcon />
							</button>
						</div>
					</div>
				)}
			</div>
		</Box>
	);
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
