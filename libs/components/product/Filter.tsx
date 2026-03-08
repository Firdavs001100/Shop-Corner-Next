import React, { useCallback, useEffect, useState } from 'react';
import { Stack, Checkbox, Slider, OutlinedInput, IconButton, Tooltip } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductCategory, ProductDressStyle, ProductSize } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchIcon from '@mui/icons-material/Search';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

interface ProductFilterProps {
	searchFilter: ProductsInquiry;
	setSearchFilter: any;
	initialInput: ProductsInquiry;
}

const SIZES = Object.values(ProductSize);
const CATEGORIES = Object.values(ProductCategory);
const DRESS_STYLES = Object.values(ProductDressStyle);

const BRANDS = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', "Levi's", 'Gucci', 'Puma'];

const COLORS = [
	{ label: 'Black', value: 'black', hex: '#1a1a1a' },
	{ label: 'White', value: 'white', hex: '#f5f5f5' },
	{ label: 'Navy', value: 'navy', hex: '#1a2c4e' },
	{ label: 'Beige', value: 'beige', hex: '#d4b896' },
	{ label: 'Red', value: 'red', hex: '#c0392b' },
	{ label: 'Green', value: 'green', hex: '#2d6a4f' },
	{ label: 'Grey', value: 'grey', hex: '#8e9aaa' },
	{ label: 'Brown', value: 'brown', hex: '#7b5e3a' },
];

const formatWon = (v: number) => v.toLocaleString('ko-KR');

/* ------------------------------------------------ */
interface SectionProps {
	title: string;
	hasActive?: boolean;
	onReset?: () => void;
	defaultOpen?: boolean;
	children: React.ReactNode;
}

const FilterSection = ({ title, hasActive, onReset, defaultOpen = true, children }: SectionProps) => {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="product-filter__section">
			<div className="product-filter__section-head" onClick={() => setOpen(!open)}>
				<span className="product-filter__title">{title}</span>

				<div className="product-filter__section-actions">
					{hasActive && onReset && (
						<button
							className="product-filter__reset"
							onClick={(e) => {
								e.stopPropagation();
								onReset();
							}}
						>
							Reset
						</button>
					)}

					{open ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
				</div>
			</div>

			<div className={`product-filter__section-body ${open ? 'open' : ''}`}>{children}</div>
		</div>
	);
};

/* ------------------------------------------------ */

const ProductFilter = ({ searchFilter, setSearchFilter, initialInput }: ProductFilterProps) => {
	const device = useDeviceDetect();
	const router = useRouter();

	const [searchText, setSearchText] = useState('');
	const [priceRange, setPriceRange] = useState<number[]>([
		searchFilter?.search?.pricesRange?.start ?? 0,
		searchFilter?.search?.pricesRange?.end ?? 5000000,
	]);

	useEffect(() => {
		const keys = ['categoryList', 'sizeList', 'colorList', 'dressStyleList', 'brandList'] as const;

		keys.forEach((key) => {
			if ((searchFilter?.search as any)?.[key]?.length === 0) {
				const updated = { ...searchFilter, search: { ...searchFilter.search } };
				delete (updated.search as any)[key];

				pushFilter(updated);
			}
		});
	}, [searchFilter]);

	const pushFilter = async (filter: ProductsInquiry) => {
		await router.push(`/product?input=${JSON.stringify(filter)}`, `/product?input=${JSON.stringify(filter)}`, {
			scroll: false,
		});
	};

	const resetSection = async (key: string) => {
		const updated = { ...searchFilter, search: { ...searchFilter.search } };

		delete (updated.search as any)[key];

		await pushFilter(updated);
	};

	const toggleListItem = async (key: string, value: string) => {
		const current: string[] = (searchFilter?.search as any)?.[key] || [];

		const exists = current.includes(value);

		const updated = {
			...searchFilter,
			search: {
				...searchFilter.search,
				[key]: exists ? current.filter((v) => v !== value) : [...current, value],
			},
		};

		await pushFilter(updated);
	};

	const categoryHandler = useCallback(async (e: any) => toggleListItem('categoryList', e.target.value), [searchFilter]);

	const sizeHandler = useCallback(async (size: ProductSize) => toggleListItem('sizeList', size), [searchFilter]);

	const colorHandler = useCallback(async (color: string) => toggleListItem('colorList', color), [searchFilter]);

	const dressStyleHandler = useCallback(
		async (e: any) => toggleListItem('dressStyleList', e.target.value),
		[searchFilter],
	);

	const brandHandler = useCallback(async (e: any) => toggleListItem('brandList', e.target.value), [searchFilter]);

	const priceCommitHandler = useCallback(
		async (_: any, value: number | number[]) => {
			const [start, end] = value as number[];

			await pushFilter({
				...searchFilter,
				search: { ...searchFilter.search, pricesRange: { start, end } },
			});
		},
		[searchFilter],
	);

	const searchHandler = useCallback(async () => {
		await pushFilter({
			...searchFilter,
			search: { ...searchFilter.search, text: searchText },
		});
	}, [searchFilter, searchText]);

	const refreshHandler = async () => {
		setSearchText('');
		setPriceRange([0, 5000000]);

		await pushFilter(initialInput);
	};

	if (device === 'mobile') return <div>PRODUCT FILTER MOBILE</div>;

	return (
		<div className="product-filter">
			{/* HEADER */}

			<div className="product-filter__header">
				<div className="product-filter__header-left">
					<TuneRoundedIcon fontSize="small" />
					<span>Filter By</span>
				</div>

				<button className="product-filter__clear-all" onClick={refreshHandler}>
					Clear All
				</button>
			</div>

			{/* SEARCH */}

			<FilterSection title="Search">
				<Stack className="product-filter__search-box">
					<OutlinedInput
						className="product-filter__search-input"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						placeholder="Search products..."
						onKeyDown={(e) => {
							if (e.key === 'Enter') searchHandler();
						}}
						endAdornment={
							<>
								{searchText && (
									<IconButton size="small" onClick={() => setSearchText('')}>
										<CancelRoundedIcon fontSize="small" />
									</IconButton>
								)}

								<IconButton size="small" onClick={searchHandler}>
									<SearchIcon fontSize="small" />
								</IconButton>
							</>
						}
					/>
				</Stack>
			</FilterSection>

			{/* CATEGORY */}

			<FilterSection
				title="Category"
				defaultOpen={false}
				hasActive={(searchFilter?.search?.categoryList?.length ?? 0) > 0}
				onReset={() => resetSection('categoryList')}
			>
				<div className="product-filter__check-list">
					{CATEGORIES.map((cat) => (
						<div key={cat} className="product-filter__check-item">
							<Checkbox
								id={cat}
								size="small"
								value={cat}
								checked={(searchFilter?.search?.categoryList || []).includes(cat)}
								onChange={categoryHandler}
							/>

							<label htmlFor={cat} className="product-filter__label">
								{cat.replace(/_/g, ' ')}
							</label>
						</div>
					))}
				</div>
			</FilterSection>

			{/* SIZE */}

			<FilterSection
				title="Size"
				hasActive={(searchFilter?.search?.sizeList?.length ?? 0) > 0}
				onReset={() => resetSection('sizeList')}
			>
				<div className="product-filter__size-grid">
					{SIZES.map((size) => (
						<button
							key={size}
							className={`product-filter__size-btn${
								(searchFilter?.search?.sizeList || []).includes(size) ? ' product-filter__size-btn--active' : ''
							}`}
							onClick={() => sizeHandler(size)}
						>
							{size}
						</button>
					))}
				</div>
			</FilterSection>

			{/* COLOR */}

			<FilterSection
				title="Color"
				hasActive={(searchFilter?.search?.colorList?.length ?? 0) > 0}
				onReset={() => resetSection('colorList')}
			>
				<div className="product-filter__color-grid">
					{COLORS.map(({ label, value, hex }) => (
						<Tooltip key={value} title={label}>
							<button
								className={`product-filter__color-btn${
									(searchFilter?.search?.colorList || []).includes(value) ? ' product-filter__color-btn--active' : ''
								}`}
								style={{ background: hex }}
								onClick={() => colorHandler(value)}
							/>
						</Tooltip>
					))}
				</div>
			</FilterSection>

			{/* BRAND */}

			<FilterSection
				title="Brand"
				defaultOpen={false}
				hasActive={(searchFilter?.search?.brandList?.length ?? 0) > 0}
				onReset={() => resetSection('brandList')}
			>
				<div className="product-filter__check-list">
					{BRANDS.map((brand) => (
						<div key={brand} className="product-filter__check-item">
							<Checkbox
								id={brand}
								size="small"
								value={brand}
								checked={(searchFilter?.search?.brandList || []).includes(brand)}
								onChange={brandHandler}
							/>

							<label htmlFor={brand} className="product-filter__label">
								{brand}
							</label>
						</div>
					))}
				</div>
			</FilterSection>

			{/* PRICE */}

			<FilterSection title="Price Range">
				<Slider
					value={priceRange}
					min={0}
					max={5000000}
					onChange={(_, val) => setPriceRange(val as number[])}
					onChangeCommitted={priceCommitHandler}
					valueLabelDisplay="auto"
					valueLabelFormat={(v) => `₩${formatWon(v)}`}
					className="product-filter__slider"
				/>

				<Stack direction="row" justifyContent="space-between" className="product-filter__price-labels">
					<span>₩{formatWon(priceRange[0])}</span>
					<span>₩{formatWon(priceRange[1])}</span>
				</Stack>
			</FilterSection>
		</div>
	);
};

export default ProductFilter;
