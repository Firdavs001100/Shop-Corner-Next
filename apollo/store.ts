import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberRank: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberWarnings: 0,
	memberBlocks: 0,
});

// @ts-ignore
export const socketVar = makeVar<WebSocket>();

/* CART TYPE */

export interface CartItem {
	_id: string;
	name: string;
	price: number;
	image: string;
	quantity: number;
}

/* INITIAL CART (RESTORE FROM LOCALSTORAGE) */

const initialCart = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cart') || '[]') : [];

/* REACTIVE VAR */

export const cartVar = makeVar<CartItem[]>(initialCart);

/* PERSIST CART */

if (typeof window !== 'undefined') {
	cartVar.onNextChange((cart) => {
		localStorage.setItem('cart', JSON.stringify(cart));
	});
}
