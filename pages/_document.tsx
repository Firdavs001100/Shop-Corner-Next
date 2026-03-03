import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index, follow" />
				<link rel="icon" type="image/png" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta
					name="keywords"
					content="ShopCorner, ShopCo, online clothing store, fashion ecommerce, buy clothes online, premium fashion, men fashion, women fashion, streetwear, luxury clothing"
				/>
				<meta
					name="description"
					content="ShopCorner (ShopCo) is a modern e-commerce clothing platform where you can discover and shop premium fashion for every style. Explore a wide selection of men's and women's clothing, streetwear, luxury pieces, and everyday essentials — all in one place. Elevate your wardrobe with quality, style, and confidence."
				/>
				<meta name="author" content="ShopCorner (ShopCo)" />
				<meta property="og:title" content="ShopCorner (ShopCo) | Premium Online Clothing Store" />
				<meta
					property="og:description"
					content="Discover premium fashion at ShopCorner (ShopCo). Shop the latest trends, luxury essentials, and everyday wear in one modern online destination."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="ShopCorner" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
