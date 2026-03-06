import React from 'react';
import { Box, IconButton, Rating, Typography } from '@mui/material';
import { Product } from '../../types/product/product';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { addToCart } from '../../../apollo/actions/cartActions';

interface NewProductCardProps {
	product: Product;
	likeProductHandler: any;
	variant?: 'default' | 'slider';
}

const ProductCard = (props: NewProductCardProps) => {
	const { product, likeProductHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** HANDLERS **/

	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: '/product/detail', query: { id: productId } });
	};

	const handleAddToCart = (e: React.MouseEvent, product: any) => {
		e.stopPropagation();
		const finalPrice =
			product.isDiscounted && product.productSalePrice ? product.productSalePrice : product.productPrice;

		addToCart({
			_id: product._id,
			name: product.productName,
			price: finalPrice,
			image: `${process.env.NEXT_PUBLIC_API_URL}/${product.productImages[0]}`,
			quantity: 1,
		});
	};

	// component
	const discountPercent =
		product.isDiscounted && product.productPrice > 0 && product.productSalePrice !== undefined
			? Math.round(((product.productPrice - product.productSalePrice) / product.productPrice) * 100)
			: 0;

	const imagePath = product.productImages?.[0]
		? `${process.env.NEXT_PUBLIC_API_URL}/${product.productImages[0]}`
		: '/img/default.png';

	return (
		<Box className={`new-product-card ${props.variant === 'slider' ? 'new-product-card--slider' : ''}`}>
			<div className="image-box" onClick={() => pushDetailHandler(product._id)}>
				<img src={imagePath} alt={product.productName} className="first-image" />

				{product.productImages?.[1] && (
					<img
						src={`${process.env.NEXT_PUBLIC_API_URL}/${product.productImages[1]}`}
						alt={product.productName}
						className="second-image"
					/>
				)}

				{product.isDiscounted && discountPercent > 0 && <div className="discount-tag">⚡ -{discountPercent}%</div>}

				{/* Add to Cart Button */}
				<button className="product-add" onClick={(e) => handleAddToCart(e, product)}>
					<ShoppingCartIcon sx={{ fontSize: 18, mr: 1 }} />
					Add to Cart
				</button>
			</div>

			<div className="info">
				<h3 className="title">
					{product.productName.length > 25 ? `${product.productName.slice(0, 26)}...` : product.productName}
				</h3>

				<div className="rating-row">
					<Rating value={product.productRank || 0} readOnly size="small" precision={0.5} />
					<span className="count">({product.productViews || 0})</span>
				</div>

				<div className="price-row">
					<div className="price-box">
						<span className="current">
							₩
							{product.isDiscounted && product.productSalePrice
								? product.productSalePrice.toLocaleString()
								: product.productPrice.toLocaleString()}
						</span>

						{product.isDiscounted && <span className="old">${product.productPrice.toLocaleString()}</span>}
					</div>
					<div className="like-box">
						<IconButton color={'default'} onClick={() => likeProductHandler(user, product?._id)}>
							{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon style={{ color: 'red' }} />
							) : (
								<FavoriteIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{product?.productLikes}</Typography>
					</div>
				</div>
			</div>
		</Box>
	);
};

export default ProductCard;
