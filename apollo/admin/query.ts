import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberArticles
				memberFollowers
				memberFollowings
				memberPoints
				memberLikes
				memberViews
				memberComments
				memberRank
				memberWarnings
				memberBlocks
				deletedAt
				createdAt
				updatedAt
				accessToken
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				memberEmail
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        PRODUCT        *
 *************************/

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
	query GetAllProductsByAdmin($input: AllProductsInquiry!) {
		getAllProductsByAdmin(input: $input) {
			list {
				_id
				productStatus
				productName
				productSlug
				productDesc
				productCategory
				productDressStyle
				productPrice
				productSalePrice
				productSize
				productColor
				productMaterial
				productBrand
				productImages
				productStockCount
				productViews
				productLikes
				productTags
				productRank
				productSales
				isDiscounted
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				productComments
				productRating
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberEmail
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberArticles
					memberFollowers
					memberFollowings
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
					meLiked {
						memberId
						likeRefId
						myFavorite
					}
					meFollowed {
						followingId
						followerId
						myFollowing
					}
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetAllComments($input: AllCommentsInquiry!) {
		getAllComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				commentRating
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberEmail
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberArticles
					memberFollowers
					memberFollowings
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
					meLiked {
						memberId
						likeRefId
						myFavorite
					}
					meFollowed {
						followingId
						followerId
						myFollowing
					}
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const GET_NOTICES_BY_ADMIN = gql`
	query GetNoticesByAdmin($input: AllNoticesInquiry!) {
		getNoticesByAdmin(input: $input) {
			list {
				_id
				noticeCategory
				noticeStatus
				noticeTitle
				noticeContent
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const GET_ALL_NOTIFICATIONS_BY_ADMIN = gql`
	query GetAllNotificationsByAdmin($input: NotificationInquiry!) {
		getAllNotificationsByAdmin(input: $input) {
			list {
				_id
				notificationType
				notificationStatus
				notificationGroup
				notificationTitle
				notificationDesc
				authorId
				receiverId
				productId
				articleId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *          ORDER         *
 *************************/

export const GET_ALL_ORDERS_BY_ADMIN = gql`
	query GetAllOrdersByAdmin($input: OrdersInquiry!) {
		getAllOrdersByAdmin(input: $input) {
			list {
				_id
				memberId
				orderStatus
				orderPaymentStatus
				orderTotal
				orderDelivery
				isDeleted
				deletedAt
				createdAt
				updatedAt
				orderShippingAddress {
					fullAddress
				}
				orderItems {
					_id
					orderId
					productId
					itemQuantity
					itemPrice
					createdAt
					updatedAt
				}
				productData {
					_id
					productStatus
					productName
					productSlug
					productDesc
					productCategory
					productDressStyle
					productPrice
					productSalePrice
					productSize
					productColor
					productMaterial
					productBrand
					productImages
					productStockCount
					productViews
					productLikes
					productTags
					productRank
					productSales
					productRating
					isDiscounted
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *       DASHBOARD       *
 *************************/
export const GET_DASHBOARD_OVERVIEW = gql`
	query GetDashboardOverview {
		getDashboardOverview {
			totalMembers
			totalProducts
			totalOrders
			totalArticles
			totalRevenue
			todayRevenue
			todayOrders
		}
	}
`;

export const GET_SALES_ANALYTICS = gql`
	query GetSalesAnalytics($input: DashboardPeriodFilterInput!) {
		getSalesAnalytics(input: $input) {
			list {
				date
				revenue
				orders
			}
		}
	}
`;

export const GET_RECENT_ACTIVITY = gql`
	query GetRecentActivity($input: DashboardActivityInput!) {
		getRecentActivity(input: $input) {
			recentOrders {
				_id
				orderTotal
				createdAt
				memberId
			}
			recentMembers {
				_id
				memberNick
				createdAt
			}
			recentArticles {
				_id
				articleTitle
				createdAt
			}
		}
	}
`;

export const GET_ADMIN_ALERTS = gql`
	query GetAdminAlerts {
		getAdminAlerts {
			lowStockProducts
			pendingOrders
			deletedArticles
		}
	}
`;

export const GET_DASHBOARD_INSIGHTS = gql`
	query GetDashboardInsights {
		getDashboardInsights {
			topSellingProducts {
				_id
				productName
				soldCount
			}
			topCustomers {
				_id
				memberNick
				totalSpent
			}
			orderStatusStats {
				status
				count
			}
		}
	}
`;

export const GET_INVENTORY_STATUS = gql`
	query GetInventoryStatus {
		getInventoryStatus {
			inStock
			lowStock
			outOfStock
		}
	}
`;

export const GET_REVENUE_BY_PERIOD = gql`
	query GetRevenueByPeriod($input: DashboardDateRangeInput!) {
		getRevenueByPeriod(input: $input) {
			total
			breakdown {
				date
				amount
			}
		}
	}
`;
