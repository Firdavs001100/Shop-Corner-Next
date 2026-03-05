import { cartVar, CartItem } from '../store';

/* ── UPDATE LOCAL STORAGE AND REACTIVE VAR -─ */
const persistCart = (cart: CartItem[]) => {
	cartVar(cart);
	if (typeof window !== 'undefined') {
		localStorage.setItem('cart', JSON.stringify(cart));
	}
};

/* ── ADD ITEM ── */
export const addToCart = (item: CartItem) => {
	const cart = cartVar();
	const exist = cart.find((x) => x._id === item._id);

	if (exist) {
		persistCart(cart.map((x) => (x._id === item._id ? { ...x, quantity: x.quantity + 1 } : x)));
	} else {
		persistCart([...cart, { ...item, quantity: 1 }]);
	}
};

/* ── DECREASE ONE ITEM ── */
export const decreaseCart = (id: string) => {
	const cart = cartVar();
	const exist = cart.find((x) => x._id === id);

	if (!exist) return;

	if (exist.quantity === 1) {
		persistCart(cart.filter((x) => x._id !== id));
	} else {
		persistCart(cart.map((x) => (x._id === id ? { ...x, quantity: x.quantity - 1 } : x)));
	}
};

/* ── REMOVE SPECIFIC ITEM (1 QUANTITY) ── */
export const removeFromCart = (id: string) => {
	decreaseCart(id); // simply delegate to decreaseCart
};

/* ── INCREASE ITEM ── */
export const increaseCart = (id: string) => {
	const cart = cartVar();
	persistCart(cart.map((x) => (x._id === id ? { ...x, quantity: x.quantity + 1 } : x)));
};

/* ── DELETE ITEM COMPLETELY ── */
export const deleteFromCart = (id: string) => {
	persistCart(cartVar().filter((x) => x._id !== id));
};

/* ── CLEAR ENTIRE CART ── */
export const clearCart = () => {
	persistCart([]);
};
