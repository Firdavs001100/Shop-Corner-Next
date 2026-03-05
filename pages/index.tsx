import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Stack } from '@mui/material';
import HomeShowcase from '../libs/components/homepage/HomeShowcase';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import NewProducts from '../libs/components/homepage/NewProducts';
import PromoSection from '../libs/components/homepage/PromoSection';

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
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<HomeShowcase />
				<NewProducts />
				<PromoSection />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
