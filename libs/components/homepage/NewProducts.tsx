import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import { useRouter } from 'next/router';

interface NewProductsProps {
	initialInput: ProductsInquiry;
}

const NewProducts = ({ initialInput }: NewProductsProps) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [products, setProducts] = useState<Product[]>([]);

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

	/** HANDLERS **/

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProduct({ variables: { input: id } });
			await getProductsRefetch({ input: initialInput });
			toastSmallSuccess('Success', 800);
		} catch (err: any) {
			toastErrorHandling(err.message);
		}
	};

	const pushAllProductsHandler = async () => {
		await router.push({ pathname: '/product' });
	};

	const renderEmptyState = () => <Box className="empty-list">Products aren't available</Box>;

	if (device === 'mobile') {
		return (
			<Box className="new-products-section">
				<div className="container">
					<Box className="section-header">
						<span className="sub-title">NEW ARRIVALS</span>
						<h2 className="main-title">Our Newest Product</h2>
					</Box>

					{getProductsLoading ? (
						<Box className="loading-box">
							<CircularProgress />
						</Box>
					) : (
						<>
							<Swiper
								slidesPerView={1.2}
								spaceBetween={20}
								centeredSlides
								autoplay={{ delay: 3000 }}
								modules={[Autoplay]}
							>
								{products.length > 0
									? products.map((product) => (
											<SwiperSlide key={product._id}>
												<ProductCard product={product} likeProductHandler={likeProductHandler} />
											</SwiperSlide>
									  ))
									: renderEmptyState()}
							</Swiper>

							<Box className="bottom-box">
								<Button className="view-all-btn" onClick={() => pushAllProductsHandler()}>
									View All
								</Button>
							</Box>
						</>
					)}
				</div>
			</Box>
		);
	} else {
		return (
			<Box className="new-products-section">
				<div className="container">
					<Box className="section-header">
						<span className="sub-title">NEW ARRIVALS</span>
						<h2 className="main-title">Our Newest Product</h2>
					</Box>

					{getProductsLoading ? (
						<Box className="loading-box">
							<CircularProgress />
						</Box>
					) : (
						<>
							<Box className="product-grid">
								{products.length > 0
									? products.map((product) => (
											<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
									  ))
									: renderEmptyState()}
							</Box>

							<Box className="bottom-box">
								<Button className="view-all-btn" onClick={() => pushAllProductsHandler()}>
									View All
								</Button>
							</Box>
						</>
					)}
				</div>
			</Box>
		);
	}
};

NewProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 4,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default NewProducts;
