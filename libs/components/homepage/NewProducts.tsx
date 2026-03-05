import React, { useState } from 'react';
import { Stack, Box, Button, Container, CircularProgress } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import NewProductCard from './NewProductsCard';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import { useRouter } from 'next/router';

interface NewProductsProps {
	initialInput: ProductsInquiry;
}

const NewProducts = (props: NewProductsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();

	const [products, setProducts] = useState<Product[]>([]);

	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list || []);
		},
	});

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	/** HANDLERS **/

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProduct({
				variables: { input: id },
			});
			await getProductsRefetch({ input: initialInput });

			toastSmallSuccess('Success', 800);
		} catch (err: any) {
			console.log('Error, likeProductHandler:', err.message);
			toastErrorHandling(err.message);
		}
	};

	const pushAllProductsHandler = async () => {
		await router.push({ pathname: '/product' });
	};

	// component
	const renderEmptyState = () => <Box className="empty-list">Products aren't available</Box>;

	return (
		<Box className="new-products-section">
			<Container maxWidth="lg">
				<Stack className="section-header">
					<span className="sub-title">NEW ARRIVALS</span>
					<h2 className="main-title">Our Newest Product</h2>
				</Stack>

				{getProductsLoading ? (
					<Box className="loading-box">
						<CircularProgress />
					</Box>
				) : (
					<>
						{device === 'mobile' ? (
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
												<NewProductCard product={product} likeProductHandler={likeProductHandler} />
											</SwiperSlide>
									  ))
									: renderEmptyState()}
							</Swiper>
						) : (
							<Stack className="product-grid">
								{products.length > 0
									? products.map((product) => (
											<NewProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
									  ))
									: renderEmptyState()}
							</Stack>
						)}

						<Box className="bottom-box">
							<Button className="view-all-btn" onClick={() => pushAllProductsHandler()}>
								View All
							</Button>
						</Box>
					</>
				)}
			</Container>
		</Box>
	);
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
