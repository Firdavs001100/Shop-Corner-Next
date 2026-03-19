import { TotalCounter } from '../member/member';
import { OrderPaymentStatus, OrderStatus } from '../../enums/order.enum';
import { Product } from '../product/product';

export interface ShippingAddress {
	fullAddress: string;
}

export interface OrderItem {
	_id: string;
	orderId: string;
	productId: string;
	itemQuantity: number;
	itemPrice: number;
	itemSize: string;
	itemColor: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Order {
	_id: string;
	memberId: string;
	orderStatus: OrderStatus;
	orderPaymentStatus: OrderPaymentStatus;
	orderShippingAddress: ShippingAddress;
	orderTotal: number;
	orderDelivery: number;
	isDeleted: boolean;
	deletedAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;

	/** from aggregation **/
	orderItems?: OrderItem[];
	productData?: Product[];
}

export interface Orders {
	list: Order[];
	metaCounter?: TotalCounter[];
}
