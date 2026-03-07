import { Box, Container, Typography } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const features = [
	{
		icon: <LocalShippingOutlinedIcon />,
		title: 'Free Shipping',
		description: 'Free Shipping to Make Your Shopping Experience Seamless.',
	},
	{
		icon: <CachedOutlinedIcon />,
		title: 'Return Policy',
		description: 'Flexible Returns to Ensure a Positive Shopping Experience.',
	},
	{
		icon: <SavingsOutlinedIcon />,
		title: 'Save Money',
		description: 'Shop Smarter and Save Big with Our Money-Saving Solutions.',
	},
	{
		icon: <HeadsetMicOutlinedIcon />,
		title: 'Support 24/7',
		description: 'Unparalleled Support, Tailored to Your Needs 24 Hours a Day.',
	},
];

const FeaturesBanner = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Box className="features-banner">
				<Container maxWidth="lg">
					<Box className="features-grid">
						{features.map((feature, index) => (
							<Box key={index} className="feature-item">
								<Box className="feature-icon">{feature.icon}</Box>
								<Typography className="feature-title">{feature.title}</Typography>
								<Typography className="feature-desc">{feature.description}</Typography>
							</Box>
						))}
					</Box>
				</Container>
			</Box>
		);
	} else {
		return (
			<Box className="features-banner">
				<Container maxWidth="lg">
					<Box className="features-grid">
						{features.map((feature, index) => (
							<Box key={index} className="feature-item">
								<Box className="feature-icon">{feature.icon}</Box>
								<Typography className="feature-title">{feature.title}</Typography>
								<Typography className="feature-desc">{feature.description}</Typography>
							</Box>
						))}
					</Box>
				</Container>
			</Box>
		);
	}
};

export default FeaturesBanner;
