import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { CircularProgress, Stack, Pagination } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_PRODUCT, GET_PRODUCTS, GET_COMMENTS } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { addToCart } from '../../apollo/actions/cartActions';
import { formatSize } from '../../libs/utils';
import { Product } from '../../libs/types/product/product';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { NEXT_PUBLIC_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { toastErrorHandling, toastSmallSuccess, toastLoginConfirm } from '../../libs/toast';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import ShareIcon from '@mui/icons-material/Share';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Review from '../../libs/components/product/Review';
import ProductCard from '../../libs/components/common/ProductCard';
import Link from 'next/link';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const TABS = ['Description', 'Delivery Policy', 'Shipping & Return'];

const ProductDetail: NextPage = ({ initialComment }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [productId, setProductId] = useState<string | null>(null);
	const [product, setProduct] = useState<Product | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [slideIndex, setSlideIndex] = useState<number>(0);
	const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

	const [selectedSize, setSelectedSize] = useState<string>('');
	const [selectedColor, setSelectedColor] = useState<string>('');
	const [quantity, setQuantity] = useState<number>(1);
	const [activeTab, setActiveTab] = useState<string>('Description');

	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PRODUCT,
		commentContent: '',
		commentRefId: '',
	});
	const [userRating, setUserRating] = useState<number>(0);
	const [hoverRating, setHoverRating] = useState<number>(0);
	const [ratingError, setRatingError] = useState<boolean>(false);

	/** APOLLO **/
	const { loading: productLoading, refetch: refetchProduct } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { input: productId },
		skip: !productId,
		onCompleted: (data: T) => {
			if (data?.getProduct) {
				setProduct(data.getProduct);
				setSlideImage(data.getProduct.productImages?.[0] ?? '');
				setSlideIndex(0);
				const colors = data.getProduct.productColor ?? [];
				setSelectedColor(colors.length >= 1 ? colors[0] : '');
			}
		},
	});

	useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					categoryList: product?.productCategory ? [product.productCategory] : [],
				},
			},
		},
		skip: !product,
		onCompleted: (data: T) => {
			if (data?.getProducts?.list) {
				setRelatedProducts(data.getProducts.list.filter((p: Product) => p._id !== productId));
			}
		},
	});

	const { refetch: refetchComments } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setComments(data.getComments.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [createComment] = useMutation(CREATE_COMMENT);

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			const id = router.query.id as string;
			setProduct(null);
			setRelatedProducts([]);
			setSlideImage('');
			setSlideIndex(0);
			setSelectedSize('');
			setSelectedColor('');
			setProductId(id);
			setCommentInquiry({
				...commentInquiry,
				search: { commentRefId: id },
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: id,
			});
		}
	}, [router.query.id]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			refetchComments({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const likeHandler = async () => {
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
			await likeTargetProduct({ variables: { input: productId } });
			await refetchProduct({ input: productId });
			toastSmallSuccess('Success', 800);
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const addToCartHandler = (product: Product) => {
		if (!selectedSize) {
			toastErrorHandling({ message: 'Please select a size first' });
			return;
		}

		const multipleColors = (product.productColor ?? []).length > 1;
		if (multipleColors && !selectedColor) {
			toastErrorHandling({ message: 'Please select a color first' });
			return;
		}

		const finalPrice =
			product.isDiscounted && product.productSalePrice ? product.productSalePrice : product.productPrice;

		const color = selectedColor || product.productColor?.[0];

		addToCart({
			_id: product._id,
			name: product.productName,
			price: finalPrice,
			image: `${process.env.NEXT_PUBLIC_API_URL}/${product.productImages[0]}`,
			quantity,
			size: selectedSize,
			color,
		});

		toastSmallSuccess(`Added to bag! (${formatSize(selectedSize)}${color ? ` · ${color}` : ''})`, 1200);
	};

	const createCommentHandler = async () => {
		try {
			if (!user?._id) {
				const ok = await toastLoginConfirm('Please log in to leave a comment');
				if (ok) {
					router.push({ pathname: router.pathname, query: { ...router.query, auth: 'login' } }, undefined, {
						shallow: true,
					});
				}
				return;
			}

			// ── Rating required: scroll to stars and show error state ──
			if (userRating === 0) {
				setRatingError(true);
				const leaveEl = document.getElementById(device === 'mobile' ? 'pdm-leave-stars' : 'pd-leave-stars');
				leaveEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
				toastErrorHandling({ message: 'Please choose a rating first' });
				return;
			}

			await createComment({
				variables: {
					input: {
						...insertCommentData,
						commentRating: userRating,
					},
				},
			});

			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			setUserRating(0);
			setRatingError(false);

			const { data: commentsData } = await refetchComments({ input: commentInquiry });
			const { data: productData } = await refetchProduct({ input: productId });

			if (productData?.getProduct) {
				setProduct(productData.getProduct);
			}

			if (commentsData?.getComments?.list) setComments(commentsData.getComments.list);
			setCommentTotal(commentsData?.getComments?.metaCounter[0]?.total ?? 0);

			toastSmallSuccess('Review submitted!', 1000);

			const reviewsEl = document.getElementById(device === 'mobile' ? 'pdm-reviews' : 'pd-reviews');
			if (reviewsEl) {
				const top = reviewsEl.getBoundingClientRect().top + window.scrollY - 80;
				window.scrollTo({ top, behavior: 'smooth' });
			}
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const paginationHandler = (_: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const changeSlide = (index: number) => {
		const images = product?.productImages ?? [];
		if (!images[index]) return;
		setSlideIndex(index);
		setSlideImage(images[index]);
	};

	const touchStartX = React.useRef<number>(0);
	const touchEndX = React.useRef<number>(0);

	const onTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
		touchEndX.current = e.touches[0].clientX;
	};

	const onTouchMove = (e: React.TouchEvent) => {
		touchEndX.current = e.touches[0].clientX;
	};

	const onTouchEnd = () => {
		const diff = touchStartX.current - touchEndX.current;
		const threshold = 40;
		const images = product?.productImages ?? [];
		if (Math.abs(diff) < threshold) return;
		if (diff > 0) {
			changeSlide(Math.min(slideIndex + 1, images.length - 1));
		} else {
			changeSlide(Math.max(slideIndex - 1, 0));
		}
	};

	if (productLoading) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '60vh' }}>
				<CircularProgress size="3rem" />
			</Stack>
		);
	}

	const multipleColors = (product?.productColor ?? []).length > 1;

	// ─────────────────────────────────────────────────────────────────────────────
	// MOBILE
	// ─────────────────────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div id="product-detail-page" className="product-detail--mobile">
				<div className="pdm-gallery" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
					<div className="pdm-topbar">
						<button className="pdm-topbar__back" onClick={() => router.back()} aria-label="Go back">
							<KeyboardArrowLeftIcon />
						</button>
						<div className="pdm-topbar__actions">
							<button className="pdm-topbar__btn" onClick={likeHandler} aria-label="Like">
								{product?.meLiked?.[0]?.myFavorite ? (
									<FavoriteIcon fontSize="small" style={{ color: '#e53935' }} />
								) : (
									<FavoriteBorderIcon fontSize="small" />
								)}
							</button>
							<button
								className="pdm-topbar__btn"
								aria-label="Share"
								onClick={() => navigator.share?.({ title: product?.productName, url: window.location.href })}
							>
								<ShareIcon fontSize="small" />
							</button>
						</div>
					</div>
					<div className="pdm-gallery__main">
						<img
							src={slideImage ? `${NEXT_PUBLIC_API_URL}/${slideImage}` : '/img/product/default.webp'}
							alt={product?.productName}
						/>
					</div>
					{(product?.productImages?.length ?? 0) > 1 && (
						<div className="pdm-gallery__dots">
							{product?.productImages?.map((_: string, i: number) => (
								<button
									key={i}
									className={`pdm-gallery__dot${i === slideIndex ? ' pdm-gallery__dot--active' : ''}`}
									onClick={() => changeSlide(i)}
								/>
							))}
						</div>
					)}
				</div>

				<div className="pdm-info">
					<div className="pdm-info__header">
						<div>
							<p className="pdm-info__category">{product?.productCategory}</p>
							<h1 className="pdm-info__title">{product?.productName}</h1>
						</div>
						<div className="pdm-info__price-block">
							{product?.isDiscounted && product?.productSalePrice ? (
								<>
									<span className="pdm-info__price">₩{product.productSalePrice.toLocaleString()}</span>
									<span className="pdm-info__price--original">₩{product.productPrice.toLocaleString()}</span>
								</>
							) : (
								<span className="pdm-info__price">₩{product?.productPrice?.toLocaleString()}</span>
							)}
						</div>
					</div>

					<div
						className="pdm-info__rating"
						onClick={() => document.getElementById('pdm-reviews')?.scrollIntoView({ behavior: 'smooth' })}
					>
						{[1, 2, 3, 4, 5].map((s) => (
							<span
								key={s}
								className={`pdm-info__star${
									s <= Math.round(product?.productRating ?? 0) ? ' pdm-info__star--filled' : ''
								}`}
							>
								★
							</span>
						))}
						<span className="pdm-info__rating-count">({commentTotal})</span>
						<span className="pdm-info__view-reviews">See all</span>
					</div>

					<div
						className={`pdm-info__stock${
							(product?.productStockCount ?? 0) > 0 ? ' pdm-info__stock--in' : ' pdm-info__stock--out'
						}`}
					>
						{(product?.productStockCount ?? 0) > 0 ? '● In Stock' : '● Out of Stock'}
						{(product?.productStockCount ?? 0) > 0 && (product?.productStockCount ?? 0) <= 5 && (
							<span className="pdm-info__low-stock"> — Only {product?.productStockCount} left!</span>
						)}
					</div>

					<div className="pdm-info__divider" />

					{(product?.productSize?.length ?? 0) > 0 && (
						<div className="pdm-info__section">
							<span className="pdm-info__section-label">
								SIZE{selectedSize ? ` · ${formatSize(selectedSize)}` : ''}
							</span>
							<div className="pdm-info__sizes">
								{product?.productSize?.map((size: string) => (
									<button
										key={size}
										className={`pdm-info__size-btn${selectedSize === size ? ' pdm-info__size-btn--active' : ''}`}
										onClick={() => setSelectedSize(size)}
									>
										{formatSize(size)}
									</button>
								))}
							</div>
						</div>
					)}

					{(product?.productColor?.length ?? 0) > 0 && (
						<div className="pdm-info__section">
							<span className="pdm-info__section-label">COLOR{selectedColor ? ` · ${selectedColor}` : ''}</span>
							<div className="pdm-info__colors">
								{product?.productColor?.map((color: string) => (
									<button
										key={color}
										className={`pdm-info__color-btn${selectedColor === color ? ' pdm-info__color-btn--active' : ''}`}
										title={color}
										style={{ cursor: multipleColors ? 'pointer' : 'default' }}
										onClick={() => {
											if (multipleColors) setSelectedColor(color);
										}}
									>
										<span className="pdm-info__color-dot" style={{ background: color }} />
									</button>
								))}
							</div>
						</div>
					)}

					<div className="pdm-info__section">
						<span className="pdm-info__section-label">QUANTITY</span>
						<div className="pdm-info__qty">
							<button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
								<RemoveIcon fontSize="small" />
							</button>
							<span>{quantity}</span>
							<button onClick={() => setQuantity((q) => Math.min(product?.productStockCount ?? 99, q + 1))}>
								<AddIcon fontSize="small" />
							</button>
						</div>
					</div>

					<div className="pdm-info__divider" />

					{product?.productDesc && (
						<div className="pdm-info__section">
							<span className="pdm-info__section-label">DESCRIPTION</span>
							<p className="pdm-info__desc">{product.productDesc}</p>
						</div>
					)}

					<div className="pdm-info__meta">
						{product?.productBrand && (
							<div className="pdm-info__meta-row">
								<span className="pdm-info__meta-key">Brand</span>
								<span className="pdm-info__meta-val">{product.productBrand}</span>
							</div>
						)}
						{product?.productMaterial && (
							<div className="pdm-info__meta-row">
								<span className="pdm-info__meta-key">Material</span>
								<span className="pdm-info__meta-val">{product.productMaterial}</span>
							</div>
						)}
						<div className="pdm-info__meta-row">
							<span className="pdm-info__meta-key">Views</span>
							<span className="pdm-info__meta-val pdm-info__meta-val--views">
								<RemoveRedEyeIcon style={{ fontSize: 13, opacity: 0.5 }} />
								{product?.productViews}
							</span>
						</div>
					</div>
				</div>

				<div className="pdm-reviews" id="pdm-reviews">
					<div className="pdm-reviews__score-box">
						<StarIcon style={{ color: '#f5a623', fontSize: 32 }} />
						<div>
							<div className="pdm-reviews__score">{(product?.productRating ?? 0).toFixed(1)}</div>
							<div className="pdm-reviews__score-count">{commentTotal} reviews</div>
						</div>
					</div>

					{/* id added for scroll target, --error modifier for red state */}
					<div className={`pdm-reviews__leave${ratingError ? ' pdm-reviews__leave--error' : ''}`} id="pdm-leave-stars">
						<span className="pdm-reviews__leave-label">{ratingError ? 'Choose a rating first!' : 'Tap to rate'}</span>
						<div className="pdm-reviews__leave-stars">
							{[1, 2, 3, 4, 5].map((s) => (
								<button
									key={s}
									className={`pdm-reviews__leave-star${
										s <= (hoverRating || userRating) ? ' pdm-reviews__leave-star--active' : ''
									}`}
									onMouseEnter={() => setHoverRating(s)}
									onMouseLeave={() => setHoverRating(0)}
									onClick={() => {
										setUserRating(s);
										setRatingError(false);
									}}
								>
									★
								</button>
							))}
						</div>
					</div>

					<div className="pdm-reviews__list">
						{commentTotal === 0 ? (
							<p className="pdm-reviews__empty">No reviews yet. Be the first!</p>
						) : (
							<>
								{comments.map((comment: Comment) => (
									<Review key={comment._id} comment={comment} />
								))}
								<div className="pd-reviews__pagination">
									<Pagination
										page={commentInquiry.page}
										count={Math.ceil(commentTotal / commentInquiry.limit)}
										onChange={paginationHandler}
										shape="rounded"
										color="primary"
										size="small"
									/>
								</div>
							</>
						)}
					</div>

					<div className="pdm-reviews__form">
						<h4 className="pdm-reviews__form-title">Leave A Review</h4>
						<textarea
							className="pdm-reviews__textarea"
							placeholder="Share your experience..."
							value={insertCommentData.commentContent}
							onChange={({ target: { value } }) =>
								setInsertCommentData({ ...insertCommentData, commentContent: value })
							}
							rows={4}
						/>
						<button
							className="pdm-reviews__submit"
							disabled={insertCommentData.commentContent === '' || user?._id === ''}
							onClick={createCommentHandler}
						>
							Submit Review →
						</button>
					</div>
				</div>

				{relatedProducts.length > 0 && (
					<div className="pdm-related">
						<h3 className="pdm-related__title">You May Also Like</h3>
						<div className="pdm-related__grid">
							{relatedProducts.slice(0, 4).map((p: Product) => (
								<ProductCard key={p._id} product={p} likeProductHandler={likeHandler} listView={false} />
							))}
						</div>
					</div>
				)}

				<div className="pdm-cta">
					<button
						className="pdm-cta__add"
						onClick={() => product && addToCartHandler(product)}
						disabled={!product || product.productStockCount === 0}
					>
						Add To Bag
					</button>
					<button className="pdm-cta__buy">Buy It Now</button>
				</div>

				<div style={{ height: 88 }} />
			</div>
		);
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// DESKTOP
	// ─────────────────────────────────────────────────────────────────────────────

	return (
		<div id="product-detail-page">
			<div className="container">
				<nav className="pd-breadcrumb">
					<Link href="/">Home</Link>
					<span>•</span>
					<Link href="/product">{product?.productCategory ?? 'Products'}</Link>
					<span>•</span>
					<span>{product?.productName}</span>
				</nav>

				<div className="pd-layout">
					<div className="pd-images">
						<div className="pd-images__main">
							<img
								src={slideImage ? `${NEXT_PUBLIC_API_URL}/${slideImage}` : '/img/product/default.webp'}
								alt={product?.productName}
							/>
							<button className="pd-images__like" onClick={likeHandler} aria-label="Like">
								{product?.meLiked?.[0]?.myFavorite ? (
									<FavoriteIcon fontSize="small" style={{ color: '#e53935' }} />
								) : (
									<FavoriteBorderIcon fontSize="small" />
								)}
							</button>
						</div>
						<div className="pd-images__thumbs">
							{product?.productImages?.map((img: string) => (
								<button
									key={img}
									className={`pd-images__thumb${slideImage === img ? ' pd-images__thumb--active' : ''}`}
									onClick={() => setSlideImage(img)}
								>
									<img src={`${NEXT_PUBLIC_API_URL}/${img}`} alt="" />
								</button>
							))}
						</div>
					</div>

					<div className="pd-info">
						<h1 className="pd-info__title">{product?.productName}</h1>

						<div className="pd-info__rating">
							{[1, 2, 3, 4, 5].map((s) => (
								<span
									key={s}
									className={`pd-info__star${
										s <= Math.round(product?.productRating ?? 0) ? ' pd-info__star--filled' : ''
									}`}
								>
									★
								</span>
							))}
							<span className="pd-info__rating-count">({commentTotal})</span>
							<button
								className="pd-info__view-reviews"
								onClick={() => document.getElementById('pd-reviews')?.scrollIntoView({ behavior: 'smooth' })}
							>
								View All Reviews
							</button>
						</div>

						<div className="pd-info__price">
							{product?.isDiscounted && product?.productSalePrice ? (
								<>
									<span className="pd-info__price--sale">₩{product.productSalePrice.toLocaleString()}</span>
									<span className="pd-info__price--original">₩{product.productPrice.toLocaleString()}</span>
								</>
							) : (
								<span>₩{product?.productPrice?.toLocaleString()}</span>
							)}
						</div>

						{product?.productDesc && <p className="pd-info__desc">{product.productDesc}</p>}

						<div className="pd-info__divider" />

						<div className="pd-info__meta">
							<div className="pd-info__meta-row">
								<span className="pd-info__meta-key">AVAILABLE:</span>
								<span
									className={`pd-info__meta-val${
										(product?.productStockCount ?? 0) > 0 ? ' pd-info__meta-val--stock' : ' pd-info__meta-val--oos'
									}`}
								>
									{(product?.productStockCount ?? 0) > 0 ? 'IN STOCK ✓' : 'OUT OF STOCK'}
								</span>
							</div>
							{product?.productTags && product.productTags.length > 0 && (
								<div className="pd-info__meta-row">
									<span className="pd-info__meta-key">TAGS:</span>
									<span className="pd-info__meta-val">{product.productTags.join(', ')}</span>
								</div>
							)}
							<div className="pd-info__meta-row">
								<span className="pd-info__meta-key">CATEGORY:</span>
								<span className="pd-info__meta-val">{product?.productCategory}</span>
							</div>
							{product?.productBrand && (
								<div className="pd-info__meta-row">
									<span className="pd-info__meta-key">BRAND:</span>
									<span className="pd-info__meta-val">{product.productBrand}</span>
								</div>
							)}
							{product?.productMaterial && (
								<div className="pd-info__meta-row">
									<span className="pd-info__meta-key">MATERIAL:</span>
									<span className="pd-info__meta-val">{product.productMaterial}</span>
								</div>
							)}
							<div className="pd-info__meta-row">
								<span className="pd-info__meta-key">VIEWS:</span>
								<span className="pd-info__meta-val pd-info__meta-val--views">
									<RemoveRedEyeIcon style={{ fontSize: 14, opacity: 0.5 }} />
									{product?.productViews}
								</span>
							</div>
						</div>

						<div className="pd-info__divider" />

						{product?.productSize && product.productSize.length > 0 && (
							<div className="pd-info__section">
								<span className="pd-info__section-label">
									SIZE{selectedSize ? `: ${formatSize(selectedSize)}` : ''}
								</span>
								<div className="pd-info__sizes">
									{product.productSize.map((size: string) => (
										<button
											key={size}
											className={`pd-info__size-btn${selectedSize === size ? ' pd-info__size-btn--active' : ''}`}
											onClick={() => setSelectedSize(size)}
										>
											{formatSize(size)}
										</button>
									))}
								</div>
							</div>
						)}

						{(product?.productColor ?? []).length > 0 && (
							<div className="pd-info__section">
								<span className="pd-info__section-label">COLOR{selectedColor ? `: ${selectedColor}` : ''}</span>
								<div className="pd-info__colors">
									{product!.productColor.map((color: string) => (
										<button
											key={color}
											className={`pd-info__color-btn${selectedColor === color ? ' pd-info__color-btn--active' : ''}`}
											title={color}
											style={{ cursor: multipleColors ? 'pointer' : 'default' }}
											onClick={() => {
												if (multipleColors) setSelectedColor(color);
											}}
										>
											<span className="pd-info__color-dot" style={{ background: color }} />
										</button>
									))}
								</div>
							</div>
						)}

						<div className="pd-info__actions">
							<div className="pd-info__qty">
								<button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease">
									<RemoveIcon fontSize="small" />
								</button>
								<span>{quantity}</span>
								<button
									onClick={() => setQuantity((q) => Math.min(product?.productStockCount ?? 99, q + 1))}
									aria-label="Increase"
								>
									<AddIcon fontSize="small" />
								</button>
							</div>
							<button
								className="pd-info__add-btn"
								onClick={() => product && addToCartHandler(product)}
								disabled={!product || product.productStockCount === 0}
							>
								Add To Bag
							</button>
							<button className="pd-info__wish-btn" onClick={likeHandler} aria-label="Wishlist">
								{product?.meLiked?.[0]?.myFavorite ? (
									<FavoriteIcon fontSize="small" style={{ color: '#e53935' }} />
								) : (
									<FavoriteBorderIcon fontSize="small" />
								)}
							</button>
						</div>

						<button className="pd-info__buy-btn">Buy It Now</button>

						{product?.productStockCount !== undefined &&
							product.productStockCount <= 5 &&
							product.productStockCount > 0 && (
								<p className="pd-info__low-stock">Only {product.productStockCount} left in stock!</p>
							)}
					</div>
				</div>

				{/* ── Tabs ─────────────────────────────────────────── */}
				<div className="pd-tabs">
					<div className="pd-tabs__nav">
						{TABS.map((tab) => (
							<button
								key={tab}
								className={`pd-tabs__tab${activeTab === tab ? ' pd-tabs__tab--active' : ''}`}
								onClick={() => setActiveTab(tab)}
							>
								{tab}
							</button>
						))}
					</div>
					<div className="pd-tabs__body">
						{activeTab === 'Description' && (
							<p className="pd-tabs__text">{product?.productDesc ?? 'No description available.'}</p>
						)}
						{activeTab === 'Delivery Policy' && (
							<p className="pd-tabs__text">
								Orders ship within 5 to 10 business days. Free shipping on orders over ₩200,000.
							</p>
						)}
						{activeTab === 'Shipping & Return' && (
							<p className="pd-tabs__text">
								Returns accepted within 30 days of delivery. Item must be unworn and in original condition.
							</p>
						)}
					</div>
				</div>

				{/* ── Reviews ──────────────────────────────────────── */}
				<div className="pd-reviews" id="pd-reviews">
					<div className="pd-reviews__layout">
						<div className="pd-reviews__summary">
							<h3 className="pd-reviews__heading">Reviews</h3>
							<div className="pd-reviews__score-box">
								<StarIcon style={{ color: '#f5a623', fontSize: 40 }} />
								<div>
									<div className="pd-reviews__score">{(product?.productRating ?? 0).toFixed(1)}</div>
									<div className="pd-reviews__score-count">{commentTotal} reviews</div>
								</div>
							</div>
							<div className="pd-reviews__breakdown">
								{[5, 4, 3, 2, 1].map((star) => (
									<div key={star} className="pd-reviews__bar-row">
										<span>{star}</span>
										<StarIcon style={{ color: '#f5a623', fontSize: 12 }} />
										<div className="pd-reviews__bar">
											<div className="pd-reviews__bar-fill" style={{ width: '0%' }} />
										</div>
										<span>0</span>
									</div>
								))}
							</div>

							{/* id added for scroll target, --error modifier for red state */}
							<div className={`pd-reviews__leave${ratingError ? ' pd-reviews__leave--error' : ''}`} id="pd-leave-stars">
								<span className="pd-reviews__leave-label">
									{ratingError ? 'Choose a rating first!' : 'Tap to review'}
								</span>
								<div className="pd-reviews__leave-stars">
									{[1, 2, 3, 4, 5].map((s) => (
										<button
											key={s}
											className={`pd-reviews__leave-star${
												s <= (hoverRating || userRating) ? ' pd-reviews__leave-star--active' : ''
											}`}
											onMouseEnter={() => setHoverRating(s)}
											onMouseLeave={() => setHoverRating(0)}
											onClick={() => {
												setUserRating(s);
												setRatingError(false);
											}}
										>
											★
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="pd-reviews__list-col">
							{commentTotal === 0 ? (
								<div className="pd-reviews__empty">No reviews yet, lead the way and share your thoughts</div>
							) : (
								<>
									{comments.map((comment: Comment) => (
										<Review key={comment._id} comment={comment} />
									))}
									<div className="pd-reviews__pagination">
										<Pagination
											page={commentInquiry.page}
											count={Math.ceil(commentTotal / commentInquiry.limit)}
											onChange={paginationHandler}
											shape="rounded"
											color="primary"
										/>
									</div>
								</>
							)}
							<div className="pd-reviews__form">
								<h4 className="pd-reviews__form-title">Leave A Review</h4>
								<textarea
									className="pd-reviews__textarea"
									placeholder="Share your experience..."
									value={insertCommentData.commentContent}
									onChange={({ target: { value } }) =>
										setInsertCommentData({ ...insertCommentData, commentContent: value })
									}
									rows={4}
								/>
								<button
									className="pd-reviews__submit"
									disabled={insertCommentData.commentContent === '' || user?._id === ''}
									onClick={createCommentHandler}
								>
									Submit Review →
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* ── Related products ──────────────────────────────── */}
				{relatedProducts.length > 0 && (
					<div className="pd-related">
						<h3 className="pd-related__title">You May Also Like</h3>
						<div className="pd-related__grid">
							{relatedProducts.slice(0, 4).map((p: Product) => (
								<ProductCard key={p._id} product={p} likeProductHandler={likeHandler} listView={false} />
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

ProductDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(ProductDetail);
