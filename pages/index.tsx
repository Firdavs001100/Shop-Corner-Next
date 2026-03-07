import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Stack } from '@mui/material';
import HomeShowcase from '../libs/components/homepage/HomeShowcase';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import NewProducts from '../libs/components/homepage/NewProducts';
import PromoSection from '../libs/components/homepage/PromoSection';
import BestSellers from '../libs/components/homepage/BestSellers';
import VideoBanner from '../libs/components/homepage/VideoBanner';
import StorySection from '../libs/components/homepage/StorySection';
import FeaturesBanner from '../libs/components/homepage/FeatureBanner';
import Testimonials from '../libs/components/homepage/Testimonials';
import BlogSection from '../libs/components/homepage/BlogSection';
import NewsletterSection from '../libs/components/homepage/NewsletterSection';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<HomeShowcase />
				<NewProducts />
				<PromoSection />
				<BestSellers />
				<VideoBanner />
				<StorySection />
				<NewsletterSection />
				<FeaturesBanner />
				<Testimonials />
				<BlogSection />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<HomeShowcase />
				<NewProducts />
				<PromoSection />
				<BestSellers />
				<VideoBanner />
				<StorySection />
				<NewsletterSection />
				<FeaturesBanner />
				<Testimonials />
				<BlogSection />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
