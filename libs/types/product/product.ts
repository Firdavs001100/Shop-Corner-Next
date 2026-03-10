import { TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';
import { ProductCategory, ProductDressStyle, ProductSize, ProductStatus } from '../../enums/product.enum';

export interface Product {
	_id: string;
	productStatus: ProductStatus;
	productName: string;
	productSlug: string;
	productDesc: string;
	productCategory: ProductCategory;
	productDressStyle: ProductDressStyle;
	productPrice: number;
	productSalePrice?: number;
	productSize: ProductSize[];
	productColor: string[];
	productMaterial?: string;
	productBrand: string;
	productImages: string[];
	productStockCount: number;
	productViews: number;
	productLikes: number;
	productTags: string[];
	productRank: number;
	productComments: number;
	productSales: number;
	productRating: number;
	isDiscounted: boolean;
	createdAt: Date;
	updatedAt: Date;

	/** from aggregation **/
	meLiked?: MeLiked[];
}

export interface Products {
	list: Product[];
	metaCounter?: TotalCounter[];
}
