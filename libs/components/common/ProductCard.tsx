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
	listView?: boolean;
}

const ProductCard = (props: NewProductCardProps) => {
	const { product, likeProductHandler, listView = false } = props;
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

	const formatLikes = (count: number) => (count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : count);

	const discountPercent =
		product.isDiscounted && product.productPrice > 0 && product.productSalePrice !== undefined
			? Math.round(((product.productPrice - product.productSalePrice) / product.productPrice) * 100)
			: 0;

	const imagePath = product.productImages?.[0]
		? `${process.env.NEXT_PUBLIC_API_URL}/${product.productImages[0]}`
		: '/img/default.png';

	return (
		<Box
			className={[
				'new-product-card',
				props.variant === 'slider' ? 'new-product-card--slider' : '',
				listView ? 'new-product-card--list' : '',
			]
				.filter(Boolean)
				.join(' ')}
		>
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

				<button className="product-add" onClick={(e) => handleAddToCart(e, product)}>
					<ShoppingCartIcon sx={{ fontSize: 18, mr: 1 }} />
					Add to Cart
				</button>
			</div>

			<div className="info">
				<h3 className="title">
					{listView
						? product.productName
						: product.productName.length > 25
						? `${product.productName.slice(0, 26)}...`
						: product.productName}
				</h3>

				{/* Description — only in list view */}
				{listView && product.productDesc && (
					<p className="desc">
						{product.productDesc.length > 160 ? `${product.productDesc.slice(0, 160)}...` : product.productDesc}
					</p>
				)}

				{/* Meta tags — only in list view */}
				{listView && (
					<div className="meta-row">
						{product.productBrand && <span className="meta-tag">{product.productBrand}</span>}
						{product.productCategory && <span className="meta-tag">{product.productCategory.replace(/_/g, ' ')}</span>}
						{product.productDressStyle && (
							<span className="meta-tag">{product.productDressStyle.replace(/_/g, ' ')}</span>
						)}
					</div>
				)}

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
						{product.isDiscounted && <span className="old">₩{product.productPrice.toLocaleString()}</span>}
					</div>

					<div className="like-box">
						<IconButton color={'default'} onClick={() => likeProductHandler(user, product?._id)}>
							{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon style={{ color: 'red' }} />
							) : (
								<FavoriteIcon />
							)}
						</IconButton>
						<Typography className="like-cnt">{formatLikes(product?.productLikes)}</Typography>
					</div>
				</div>

				{/* Stock info — only in list view */}
				{listView && (
					<p className="stock-info">
						{product.productStockCount > 0 ? `${product.productStockCount} in stock` : 'Out of stock'}
					</p>
				)}
			</div>
		</Box>
	);
};

export default ProductCard;
