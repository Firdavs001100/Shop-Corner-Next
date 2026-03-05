import { Direction } from '../../enums/common.enum';
import { OrderPaymentStatus, OrderStatus } from '../../enums/order.enum';

export interface OrderItemInput {
	itemQuantity: number;
	productId: string;
	orderId?: string;
}

export interface OISearch {
	orderStatus?: OrderStatus[];
	orderPaymentStatus?: OrderPaymentStatus[];
}

export interface OrdersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: OISearch;
}
