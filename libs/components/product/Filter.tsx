import React, { useEffect, useState } from 'react';
import { Slider, Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductCategory, ProductDressStyle, ProductSize } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';

import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { OutlinedInput, IconButton, Checkbox, Tooltip } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchIcon from '@mui/icons-material/Search';

interface ProductFilterProps {
	searchFilter: ProductsInquiry;
	setSearchFilter: (filter: ProductsInquiry) => void;
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

/* ─── Section ─────────────────────────────────────────────────────────────── */

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
			{open && <div className="product-filter__section-body">{children}</div>}
		</div>
	);
};

/* ─── Filter ──────────────────────────────────────────────────────────────── */

const ProductFilter = ({ searchFilter, setSearchFilter, initialInput }: ProductFilterProps) => {
	const device = useDeviceDetect();

	const [searchText, setSearchText] = useState(searchFilter?.search?.text ?? '');
	const [priceRange, setPriceRange] = useState<number[]>([
		searchFilter?.search?.pricesRange?.start ?? 0,
		searchFilter?.search?.pricesRange?.end ?? 5000000,
	]);

	useEffect(() => {
		if (searchFilter?.search?.pricesRange) {
			setPriceRange([searchFilter.search.pricesRange.start ?? 0, searchFilter.search.pricesRange.end ?? 5000000]);
		}
		if (searchFilter?.search?.text !== undefined) setSearchText(searchFilter.search.text);
	}, [searchFilter?.search?.pricesRange, searchFilter?.search?.text]);

	const toggleListItem = (key: keyof ProductsInquiry['search'], value: string) => {
		const current = (searchFilter?.search?.[key] ?? []) as string[];
		const updatedList = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
		setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, [key]: updatedList } });
	};

	const resetSection = (key: keyof ProductsInquiry['search']) => {
		const updated = { ...searchFilter, search: { ...searchFilter.search } };
		delete updated.search[key];
		setSearchFilter(updated);
	};

	const priceCommitHandler = (_: any, value: number | number[]) => {
		const [start, end] = value as number[];
		setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { start, end } } });
	};

	const searchHandler = () => {
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: searchText } });
	};

	const refreshHandler = () => {
		setSearchText('');
		setPriceRange([0, 5000000]);
		setSearchFilter({ ...initialInput, page: 1 });
	};

	// ─── MOBILE — only Category, Size, Color, Price ────────────────────────────
	if (device === 'mobile') {
		return (
			<div className="product-filter">
				<div className="product-filter__header">
					<div className="product-filter__header-left">
						<TuneRoundedIcon fontSize="small" />
						<span>Filter By</span>
					</div>
					<button className="product-filter__clear-all" onClick={refreshHandler}>
						Clear All
					</button>
				</div>

				{/* CATEGORY */}
				<FilterSection
					title="Category"
					hasActive={(searchFilter?.search?.categoryList?.length ?? 0) > 0}
					onReset={() => resetSection('categoryList')}
				>
					<div className="product-filter__chip-list">
						{CATEGORIES.map((cat) => (
							<button
								key={cat}
								className={`product-filter__chip${
									(searchFilter?.search?.categoryList || []).includes(cat) ? ' product-filter__chip--active' : ''
								}`}
								onClick={() => toggleListItem('categoryList', cat)}
							>
								{cat.replace(/_/g, ' ')}
							</button>
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
								onClick={() => toggleListItem('sizeList', size)}
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
									onClick={() => toggleListItem('colorList', value)}
								/>
							</Tooltip>
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
	}

	// ─── DESKTOP ───────────────────────────────────────────────────────────────
	return (
		<div className="product-filter">
			<div className="product-filter__header">
				<div className="product-filter__header-left">
					<TuneRoundedIcon fontSize="small" />
					<span>Filter By</span>
				</div>
				<button className="product-filter__clear-all" onClick={refreshHandler}>
					Clear All
				</button>
			</div>

			<FilterSection title="Search">
				<Stack className="product-filter__search-box">
					<OutlinedInput
						className="product-filter__search-input"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						placeholder="Search products..."
						onKeyDown={(e) => e.key === 'Enter' && searchHandler()}
						endAdornment={
							<>
								{searchText && (
									<IconButton
										size="small"
										onClick={() => {
											setSearchText('');
											setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: '' } });
										}}
									>
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

			<FilterSection
				title="Category"
				hasActive={(searchFilter?.search?.categoryList?.length ?? 0) > 0}
				onReset={() => resetSection('categoryList')}
			>
				<div className="product-filter__check-list">
					{CATEGORIES.map((cat) => (
						<div key={cat} className="product-filter__check-item">
							<Checkbox
								size="small"
								checked={(searchFilter?.search?.categoryList || []).includes(cat)}
								onChange={() => toggleListItem('categoryList', cat)}
							/>
							<label className="product-filter__label">{cat.replace(/_/g, ' ')}</label>
						</div>
					))}
				</div>
			</FilterSection>

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
							onClick={() => toggleListItem('sizeList', size)}
						>
							{size}
						</button>
					))}
				</div>
			</FilterSection>

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
								onClick={() => toggleListItem('colorList', value)}
							/>
						</Tooltip>
					))}
				</div>
			</FilterSection>

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

			<FilterSection
				title="Dress Style"
				hasActive={(searchFilter?.search?.dressStyleList?.length ?? 0) > 0}
				onReset={() => resetSection('dressStyleList')}
			>
				<div className="product-filter__check-list">
					{DRESS_STYLES.map((style) => (
						<div key={style} className="product-filter__check-item">
							<Checkbox
								size="small"
								checked={(searchFilter?.search?.dressStyleList || []).includes(style)}
								onChange={() => toggleListItem('dressStyleList', style)}
							/>
							<label className="product-filter__label">{style.replace(/_/g, ' ')}</label>
						</div>
					))}
				</div>
			</FilterSection>

			<FilterSection
				title="Brand"
				hasActive={(searchFilter?.search?.brandList?.length ?? 0) > 0}
				onReset={() => resetSection('brandList')}
			>
				<div className="product-filter__check-list">
					{BRANDS.map((brand) => (
						<div key={brand} className="product-filter__check-item">
							<Checkbox
								size="small"
								checked={(searchFilter?.search?.brandList || []).includes(brand)}
								onChange={() => toggleListItem('brandList', brand)}
							/>
							<label className="product-filter__label">{brand}</label>
						</div>
					))}
				</div>
			</FilterSection>
		</div>
	);
};

export default ProductFilter;
