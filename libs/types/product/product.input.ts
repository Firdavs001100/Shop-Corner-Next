import { Direction } from '../../enums/common.enum';
import { ProductCategory, ProductDressStyle, ProductSize, ProductStatus } from '../../enums/product.enum';

export interface ProductInput {
	productStatus: ProductStatus;
	productName: string;
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
	productTags: string[];
	isDiscounted: boolean;
}

export interface PricesRange {
	start: number;
	end: number;
}

export interface PISearch {
	categoryList?: ProductCategory[];
	sizeList?: ProductSize[];
	brandList?: string[];
	colorList?: string[];
	dressStyleList?: ProductDressStyle[];
	pricesRange?: PricesRange;
	text?: string;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}

export interface ALPISearch {
	productStatus?: ProductStatus;
	productCategoryList?: ProductCategory[];
}

export interface AllProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPISearch;
}
