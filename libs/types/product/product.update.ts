import { ProductCategory, ProductDressStyle, ProductSize, ProductStatus } from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productStatus?: ProductStatus;
	productName?: string;
	productSlug?: string;
	productDesc?: string;
	productCategory?: ProductCategory;
	productDressStyle?: ProductDressStyle;
	productPrice?: number;
	productSalePrice?: number;
	productSize?: ProductSize[];
	productColor?: string[];
	productMaterial?: string;
	productBrand?: string;
	productImages?: string[];
	productStockCount?: number;
	productRating: number;
	productTags?: string[];
	isDiscounted?: boolean;
}
