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
				<FeaturesBanner />
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
				<FeaturesBanner />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
