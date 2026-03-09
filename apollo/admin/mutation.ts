import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
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
		}
	}
`;

/**************************
 *        PRODUCT        *
 *************************/

export const CREATE_PRODUCT_BY_ADMIN = gql`
	mutation CreateProductByAdmin($input: ProductInput!) {
		createProductByAdmin(input: $input) {
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
		}
	}
`;

export const UPDATE_PRODUCT_BY_ADMIN = gql`
	mutation UpdateProductByAdmin($input: ProductUpdate!) {
		updateProductByAdmin(input: $input) {
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
		}
	}
`;

export const REMOVE_PRODUCT_BY_ADMIN = gql`
	mutation RemoveProductByAdmin($input: String!) {
		removeProductByAdmin(productId: $input) {
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
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
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
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
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
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const CREATE_NOTICE_BY_ADMIN = gql`
	mutation CreateNoticeByAdmin($input: NoticeInput!) {
		createNoticeByAdmin(input: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			noticeContent
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_NOTICE_BY_ADMIN = gql`
	mutation UpdateNoticeByAdmin($input: NoticeUpdate!) {
		updateNoticeByAdmin(input: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			noticeContent
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const CREATE_NOTIFICATION_BY_ADMIN = gql`
	mutation CreateNotificationByAdmin($input: NotificationInput!) {
		createNotificationByAdmin(input: $input) {
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
	}
`;

export const UPDATE_NOTIFICATION_BY_ADMIN = gql`
	mutation UpdateNotificationByAdmin($input: NotificationUpdate!) {
		updateNotificationByAdmin(input: $input) {
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
	}
`;

/**************************
 *          ORDER         *
 *************************/

export const UPDATE_ORDER_BY_ADMIN = gql`
	mutation UpdateOrderByAdmin($input: OrderUpdate!) {
		updateOrderByAdmin(input: $input) {
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
		}
	}
`;
