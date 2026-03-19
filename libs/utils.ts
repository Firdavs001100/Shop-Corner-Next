import numeral from 'numeral';
import { toastError } from './toast';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

export const formatSize = (size: string): string => {
	const labels: Record<string, string> = {
		XXS: 'XXS',
		XS: 'XS',
		S: 'S',
		M: 'M',
		L: 'L',
		XL: 'XL',
		XXL: 'XXL',
		_3XL: '3XL',
		_4XL: '4XL',
		ONE_SIZE: 'One Size',
		FREE_SIZE: 'Free Size',
	};
	return labels[size] ?? size;
};

export const likeProductHandler = async (likeTargetProduct: any, user: any, id: string, isLiked: boolean) => {
	try {
		if (!user?._id) throw new Error('Please log in first.');
		await likeTargetProduct({ variables: { input: id } });
	} catch (err: any) {
		console.error(err.message);
	}
};

export const likeTargetPropertyHandler = async (likeTargetProperty: any, id: string) => {
	try {
		await likeTargetProperty({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetPropertyHandler:', err.message);
		toastError(err.message);
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
	try {
		await likeTargetBoardArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
		toastError(err.message);
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		toastError(err.message);
	}
};
