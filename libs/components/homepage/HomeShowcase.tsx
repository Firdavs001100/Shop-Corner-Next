import React, { useState } from 'react';
import { Stack, Typography, Button, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const HomeShowcase = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className="home-showcase">
				<Stack className="container">
					<Stack className="showcase-grid">
						{/* LEFT IMAGES */}
						<Stack className="showcase-images">
							<Box className="image-one-wrapper">
								<Box
									component="img"
									src="https://milana.risingbamboo.com/wp-content/uploads/2025/10/bn2-1.avif"
									alt="Fashion Look 1"
									className="showcase-image"
								/>
							</Box>

							<Box className="image-two-wrapper">
								<Box
									component="img"
									src="https://milana.risingbamboo.com/wp-content/uploads/2025/10/bn2-2.avif"
									alt="Fashion Look 2"
									className="showcase-image"
								/>
							</Box>
						</Stack>

						{/* RIGHT CONTENT */}
						<Stack className="showcase-content">
							<Typography variant="h3" className="showcase-title">
								Elevate women's <br /> beauty
							</Typography>

							<Typography variant="body1" className="showcase-description">
								Whether you're shopping our latest seasonal drops or freshening up your wardrobe staples, our aim is to
								make the experience seamless and enjoyable with responsive customer service.
							</Typography>

							<Button variant="contained" className="showcase-button">
								Shop Now
							</Button>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-showcase'}>
				<Stack className={'container'}>
					<Stack className={'showcase-grid'} direction="row">
						{/* LEFT IMAGE BLOCK */}
						<Stack className={'banner-left-image'}>
							<Box className={'banner-img-1'}>
								<Box component="img" src="https://milana.risingbamboo.com/wp-content/uploads/2025/10/bn2-1.avif" />
							</Box>

							<Box className={'banner-img-2'}>
								<Box component="img" src="https://milana.risingbamboo.com/wp-content/uploads/2025/10/bn2-2.avif" />
							</Box>
						</Stack>

						{/* RIGHT TEXT BLOCK */}
						<Stack className={'banner-right-text'}>
							<Stack className={'text-content'}>
								<Typography className={'title'}>
									Elevate your <br /> beauty
								</Typography>

								<Typography className={'desc'}>
									Whether you're shopping our latest seasonal drops or freshening up your wardrobe staples, our aim is
									to make the experience seamless and enjoyable with responsive customer service.
								</Typography>

								<Button className={'shop-btn'}>
									<span className={'button-text'}>Shop Now</span>
								</Button>
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default HomeShowcase;
