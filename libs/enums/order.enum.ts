export enum OrderStatus {
	PENDING = 'PENDING',
	PAID = 'PAID',
	SHIPPED = 'SHIPPED',
	DELIVERED = 'DELIVERED',
	CANCELLED = 'CANCELLED',
	DELETE = 'DELETE',
}

export enum OrderPaymentStatus {
	UNPAID = 'UNPAID',
	PAID = 'PAID',
	REFUNDED = 'REFUNDED',
}
