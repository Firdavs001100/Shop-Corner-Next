import React from 'react';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';

const ITEMS = [
	{
		icon: <LocalShippingOutlinedIcon />,
		title: 'Free Shipping',
		desc: 'Enjoy free worldwide shipping and returns, with customs and duties taxes included.',
	},
	{
		icon: <CachedOutlinedIcon />,
		title: 'Return Policy',
		desc: 'Free returns within 15 days, please make sure the items are in undamaged condition.',
	},
	{
		icon: <HeadsetMicOutlinedIcon />,
		title: 'Support 24/7',
		desc: 'We support customers 24/7, send questions we will solve for you immediately.',
	},
];

const PolicyBanner = () => {
	return (
		<div className="policy-banner">
			{ITEMS.map((item, i) => (
				<div key={i} className="policy-banner__item">
					<div className="policy-banner__icon">{item.icon}</div>
					<h4 className="policy-banner__title">{item.title}</h4>
					<p className="policy-banner__desc">{item.desc}</p>
				</div>
			))}
		</div>
	);
};

export default PolicyBanner;
