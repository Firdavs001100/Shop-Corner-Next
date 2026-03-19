import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import axios from 'axios';
import { ProductCategory, ProductDressStyle, ProductSize, ProductStatus } from '../../../libs/enums/product.enum';
import { NEXT_PUBLIC_API_URL } from '../../../libs/config';
import { toastSmallSuccess, toastErrorHandling } from '../../../libs/toast';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import {
	CREATE_PRODUCT_BY_ADMIN,
	UPDATE_PRODUCT_BY_ADMIN,
	REMOVE_PRODUCT_BY_ADMIN,
} from '../../../apollo/admin/mutation';

const krw = new Intl.NumberFormat('ko-KR');
const fp = (n: number) => `₩${krw.format(n)}`;
const fd = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_META: Record<ProductStatus, { label: string; bg: string; color: string; dot: string }> = {
	[ProductStatus.ACTIVE]: { label: 'Active', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
	[ProductStatus.DRAFT]: { label: 'Draft', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
	[ProductStatus.OUT_OF_STOCK]: { label: 'Out of Stock', bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
	[ProductStatus.HIDDEN]: { label: 'Hidden', bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
	[ProductStatus.DISCONTINUED]: { label: 'Discontinued', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
};

const EMPTY_FORM = {
	productName: '',
	productDesc: '',
	productCategory: ProductCategory.TSHIRT,
	productDressStyle: ProductDressStyle.CASUAL,
	productStatus: ProductStatus.DRAFT,
	productPrice: '',
	productSalePrice: '',
	productSize: [] as ProductSize[],
	productColor: '',
	productMaterial: '',
	productBrand: '',
	productStockCount: '0',
	productTags: '',
	isDiscounted: false,
};
type FormState = typeof EMPTY_FORM;

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') ?? '' : '');

const uploadImages = async (files: File[]): Promise<string[]> => {
	if (files.length === 0) return [];
	const formData = new FormData();
	formData.append(
		'operations',
		JSON.stringify({
			query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }`,
			variables: { files: new Array(files.length).fill(null), target: 'product' },
		}),
	);
	const mapObj: Record<string, string[]> = {};
	files.forEach((_, i) => {
		mapObj[`${i}`] = [`variables.files.${i}`];
	});
	formData.append('map', JSON.stringify(mapObj));
	files.forEach((file, i) => formData.append(`${i}`, file));

	const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
			'apollo-require-preflight': 'true',
			Authorization: `Bearer ${getToken()}`,
		},
	});
	if (response.data.errors) throw new Error(response.data.errors.map((e: any) => e.message).join(', '));
	return response.data.data.imagesUploader ?? [];
};

const StatusChip = ({ status }: { status: ProductStatus }) => {
	const m = STATUS_META[status] ?? STATUS_META[ProductStatus.DRAFT];
	return (
		<span className="ao-chip" style={{ background: m.bg, color: m.color }}>
			<span className="ao-chip__dot" style={{ background: m.dot }} />
			{m.label}
		</span>
	);
};

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
	<div className="admin-modal-overlay" onClick={onClose}>
		<div className="ap-modal" onClick={(e) => e.stopPropagation()}>
			<div className="ap-modal__header">
				<h3 className="ap-modal__title">{title}</h3>
				<button className="ap-modal__close" onClick={onClose}>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
			<div className="ap-modal__body">{children}</div>
		</div>
	</div>
);

const ConfirmDelete = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
	<div className="admin-modal-overlay" onClick={onCancel}>
		<div className="ap-modal ap-modal--sm" onClick={(e) => e.stopPropagation()}>
			<div className="ap-modal__header">
				<div className="ap-modal__header-icon ap-modal__header-icon--danger">
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
						<path d="M10 11v6" />
						<path d="M14 11v6" />
						<path d="M9 6V4h6v2" />
					</svg>
				</div>
				<div>
					<h3 className="ap-modal__title">Delete Product</h3>
					<p className="ap-modal__subtitle">This action cannot be undone.</p>
				</div>
			</div>
			<div className="ap-modal__body">
				<p className="ap-confirm__text">Are you sure you want to permanently delete this product?</p>
				<div className="ap-modal__footer">
					<button className="ap-btn ap-btn--ghost" onClick={onCancel}>
						Cancel
					</button>
					<button className="ap-btn ap-btn--danger" onClick={onConfirm}>
						Delete Product
					</button>
				</div>
			</div>
		</div>
	</div>
);

const ImageManager = ({
	existingImages,
	onImagesChange,
	uploading,
	setUploading,
}: {
	existingImages: string[];
	onImagesChange: (imgs: string[]) => void;
	uploading: boolean;
	setUploading: (v: boolean) => void;
}) => {
	const [kept, setKept] = useState<string[]>(existingImages);
	const [newFiles, setNewFiles] = useState<File[]>([]);
	const [newPreviews, setNewPreviews] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const canAddMore = kept.length + newFiles.length < 5;

	useEffect(() => {
		onImagesChange(kept);
	}, [kept]);

	const removeKept = (i: number) => setKept((p) => p.filter((_, idx) => idx !== i));
	const removeNew = (i: number) => {
		URL.revokeObjectURL(newPreviews[i]);
		setNewFiles((p) => p.filter((_, idx) => idx !== i));
		setNewPreviews((p) => p.filter((_, idx) => idx !== i));
	};
	const handleFiles = (files: FileList | null) => {
		if (!files) return;
		const available = 5 - kept.length - newFiles.length;
		const toAdd = Array.from(files).slice(0, available);
		setNewFiles((p) => [...p, ...toAdd]);
		setNewPreviews((p) => [...p, ...toAdd.map((f) => URL.createObjectURL(f))]);
	};

	(ImageManager as any)._uploadNewFiles = async (): Promise<string[]> => {
		if (newFiles.length === 0) return kept;
		setUploading(true);
		try {
			const uploaded = await uploadImages(newFiles);
			const merged = [...kept, ...uploaded];
			setNewFiles([]);
			setNewPreviews([]);
			setKept(merged);
			return merged;
		} finally {
			setUploading(false);
		}
	};
    
	return (
		<div className="ap-img-manager">
			{kept.length === 0 && newFiles.length === 0 ? (
				<div
					className="ap-img-manager__dropzone"
					onClick={() => inputRef.current?.click()}
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						e.preventDefault();
						handleFiles(e.dataTransfer.files);
					}}
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" />
					</svg>
					<p className="ap-img-manager__text">Click or drag images here</p>
					<p className="ap-img-manager__hint">Up to 5 images · JPG, PNG, WEBP</p>
				</div>
			) : (
				<div className="ap-img-manager__grid">
					{kept.map((img, i) => (
						<div key={`k-${i}`} className="ap-img-manager__slot">
							<img src={`${NEXT_PUBLIC_API_URL}/${img}`} alt="" />
							{i === 0 && <span className="ap-img-manager__badge">Main</span>}
							<button className="ap-img-manager__remove" type="button" onClick={() => removeKept(i)}>
								<svg
									width="10"
									height="10"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>
					))}
					{newPreviews.map((src, i) => (
						<div key={`n-${i}`} className="ap-img-manager__slot ap-img-manager__slot--new">
							<img src={src} alt="" />
							<span className="ap-img-manager__badge ap-img-manager__badge--new">New</span>
							<button className="ap-img-manager__remove" type="button" onClick={() => removeNew(i)}>
								<svg
									width="10"
									height="10"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>
					))}
					{canAddMore && (
						<div className="ap-img-manager__add-slot" onClick={() => inputRef.current?.click()}>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							>
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
						</div>
					)}
				</div>
			)}
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				multiple
				style={{ display: 'none' }}
				onChange={(e) => handleFiles(e.target.files)}
			/>
			{kept.length + newFiles.length > 0 && (
				<p className="ap-img-manager__counter">{kept.length + newFiles.length}/5 images</p>
			)}
		</div>
	);
};

const ProductForm = ({
	form,
	onChange,
	onSubmit,
	onClose,
	submitLabel,
	loading,
	existingImages,
	isEdit,
}: {
	form: FormState;
	onChange: (f: FormState) => void;
	onSubmit: (getFinalImages: () => Promise<string[]>) => void;
	onClose: () => void;
	submitLabel: string;
	loading: boolean;
	existingImages: string[];
	isEdit: boolean;
}) => {
	const set = (key: keyof FormState, val: any) => onChange({ ...form, [key]: val });
	const [uploading, setUploading] = useState(false);
	const toggleSize = (s: ProductSize) => {
		const arr = form.productSize.includes(s) ? form.productSize.filter((x) => x !== s) : [...form.productSize, s];
		set('productSize', arr);
	};
	const getFinalImages = async () => await (ImageManager as any)._uploadNewFiles();

	return (
		<div className="ap-form">
			<div className="ap-form__field">
				<label className="ap-form__label">Product Images</label>
				<ImageManager
					existingImages={existingImages}
					onImagesChange={() => {}}
					uploading={uploading}
					setUploading={setUploading}
				/>
			</div>

			<div className="ap-form__divider" />
			<div className="ap-form__section-title">Basic Info</div>

			<div className="ap-form__row">
				<div className="ap-form__field">
					<label className="ap-form__label">
						Product Name <span className="ap-form__req">*</span>
					</label>
					<input
						className="ap-form__input"
						value={form.productName}
						onChange={(e) => set('productName', e.target.value)}
						placeholder="e.g. Classic White Tee"
					/>
				</div>
				<div className="ap-form__field">
					<label className="ap-form__label">
						Brand <span className="ap-form__req">*</span>
					</label>
					<input
						className="ap-form__input"
						value={form.productBrand}
						onChange={(e) => set('productBrand', e.target.value)}
						placeholder="e.g. Nike"
					/>
				</div>
			</div>

			<div className="ap-form__field">
				<label className="ap-form__label">Description</label>
				<textarea
					className="ap-form__textarea"
					value={form.productDesc}
					onChange={(e) => set('productDesc', e.target.value)}
					rows={3}
					placeholder="Product description..."
				/>
			</div>

			<div className="ap-form__row">
				<div className="ap-form__field">
					<label className="ap-form__label">
						Category <span className="ap-form__req">*</span>
					</label>
					<select
						className="ap-form__select"
						value={form.productCategory}
						onChange={(e) => set('productCategory', e.target.value as ProductCategory)}
					>
						{Object.values(ProductCategory).map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>
				<div className="ap-form__field">
					<label className="ap-form__label">
						Dress Style <span className="ap-form__req">*</span>
					</label>
					<select
						className="ap-form__select"
						value={form.productDressStyle}
						onChange={(e) => set('productDressStyle', e.target.value as ProductDressStyle)}
					>
						{Object.values(ProductDressStyle).map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
				</div>
			</div>

			{isEdit && (
				<div className="ap-form__field">
					<label className="ap-form__label">Status</label>
					<select
						className="ap-form__select"
						value={form.productStatus}
						onChange={(e) => set('productStatus', e.target.value as ProductStatus)}
					>
						{Object.values(ProductStatus).map((s) => (
							<option key={s} value={s}>
								{STATUS_META[s].label}
							</option>
						))}
					</select>
				</div>
			)}

			<div className="ap-form__divider" />
			<div className="ap-form__section-title">Pricing & Inventory</div>

			<div className="ap-form__row ap-form__row--3">
				<div className="ap-form__field">
					<label className="ap-form__label">
						Price (₩) <span className="ap-form__req">*</span>
					</label>
					<input
						className="ap-form__input"
						type="number"
						value={form.productPrice}
						onChange={(e) => set('productPrice', e.target.value)}
						placeholder="0"
					/>
				</div>
				<div className="ap-form__field">
					<label className="ap-form__label">Sale Price (₩)</label>
					<input
						className="ap-form__input"
						type="number"
						value={form.productSalePrice}
						onChange={(e) => set('productSalePrice', e.target.value)}
						placeholder="0"
					/>
				</div>
				<div className="ap-form__field">
					<label className="ap-form__label">
						Stock <span className="ap-form__req">*</span>
					</label>
					<input
						className="ap-form__input"
						type="number"
						value={form.productStockCount}
						onChange={(e) => set('productStockCount', e.target.value)}
						placeholder="0"
					/>
				</div>
			</div>

			<label className="ap-form__check-row">
				<div className="ap-form__toggle" onClick={() => set('isDiscounted', !form.isDiscounted)}>
					<div className={`ap-form__toggle-track ${form.isDiscounted ? 'ap-form__toggle-track--on' : ''}`}>
						<div className="ap-form__toggle-thumb" />
					</div>
				</div>
				<span className="ap-form__check-label">Mark as discounted</span>
			</label>

			<div className="ap-form__divider" />
			<div className="ap-form__section-title">Details</div>

			<div className="ap-form__row">
				<div className="ap-form__field">
					<label className="ap-form__label">Material</label>
					<input
						className="ap-form__input"
						value={form.productMaterial}
						onChange={(e) => set('productMaterial', e.target.value)}
						placeholder="e.g. Cotton"
					/>
				</div>
				<div className="ap-form__field">
					<label className="ap-form__label">
						Colors <span className="ap-form__label-hint">(comma separated)</span>
					</label>
					<input
						className="ap-form__input"
						value={form.productColor}
						onChange={(e) => set('productColor', e.target.value)}
						placeholder="Red, Blue, Black"
					/>
				</div>
			</div>

			<div className="ap-form__field">
				<label className="ap-form__label">
					Tags <span className="ap-form__label-hint">(comma separated)</span>
				</label>
				<input
					className="ap-form__input"
					value={form.productTags}
					onChange={(e) => set('productTags', e.target.value)}
					placeholder="summer, sale, new"
				/>
			</div>

			<div className="ap-form__field">
				<label className="ap-form__label">Available Sizes</label>
				<div className="ap-form__sizes">
					{Object.values(ProductSize).map((s) => (
						<button
							key={s}
							type="button"
							className={`ap-form__size-pill ${form.productSize.includes(s) ? 'ap-form__size-pill--on' : ''}`}
							onClick={() => toggleSize(s)}
						>
							{s}
						</button>
					))}
				</div>
			</div>

			<div className="ap-modal__footer">
				<button className="ap-btn ap-btn--ghost" onClick={onClose} disabled={loading || uploading}>
					Cancel
				</button>
				<button
					className="ap-btn ap-btn--primary"
					onClick={() => onSubmit(getFinalImages)}
					disabled={loading || uploading || !form.productName.trim()}
				>
					{loading || uploading ? <span className="ap-btn__spinner" /> : null}
					{uploading ? 'Uploading...' : loading ? 'Saving...' : submitLabel}
				</button>
			</div>
		</div>
	);
};

const AdminProducts: NextPage = () => {
	const [page, setPage] = useState(1);
	const [products, setProducts] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
	const [addOpen, setAddOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<any | null>(null);
	const [addForm, setAddForm] = useState<FormState>({ ...EMPTY_FORM });
	const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });
	const [submitting, setSubmitting] = useState(false);
	const LIMIT = 10;

	const { data, loading, refetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: LIMIT, search: statusFilter ? { productStatus: statusFilter } : {} } },
	});

	useEffect(() => {
		if (data) {
			setProducts(data?.getAllProductsByAdmin?.list ?? []);
			setTotal(data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0);
		}
	}, [data]);
	useEffect(() => {
		setPage(1);
	}, [statusFilter]);

	const [createProduct] = useMutation(CREATE_PRODUCT_BY_ADMIN);
	const [updateProduct] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removeProduct] = useMutation(REMOVE_PRODUCT_BY_ADMIN);

	const parseArr = (val: string) =>
		val
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

	const handleStatusChange = async (id: string, productStatus: ProductStatus) => {
		try {
			await updateProduct({ variables: { input: { _id: id, productStatus } } });
			toastSmallSuccess('Updated', 800);
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return;
		try {
			await removeProduct({ variables: { input: deleteTarget } });
			toastSmallSuccess('Deleted', 800);
			setDeleteTarget(null);
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const handleAdd = async (getFinalImages: () => Promise<string[]>) => {
		if (!addForm.productName.trim() || !addForm.productBrand.trim() || !addForm.productPrice) return;
		setSubmitting(true);
		try {
			const finalImages = await getFinalImages();
			const colors = parseArr(addForm.productColor as string);
			const tags = parseArr(addForm.productTags as string);
			await createProduct({
				variables: {
					input: {
						productName: addForm.productName.trim(),
						productDesc: addForm.productDesc.trim(),
						productCategory: addForm.productCategory,
						productDressStyle: addForm.productDressStyle,
						productPrice: parseFloat(addForm.productPrice as string),
						productSalePrice: addForm.productSalePrice ? parseFloat(addForm.productSalePrice as string) : undefined,
						productSize: addForm.productSize.length > 0 ? addForm.productSize : undefined,
						productMaterial: addForm.productMaterial.trim() || undefined,
						productBrand: addForm.productBrand.trim(),
						productStockCount: parseInt(addForm.productStockCount as string, 10),
						isDiscounted: addForm.isDiscounted,
						...(finalImages.length > 0 && { productImages: finalImages }),
						...(colors.length > 0 && { productColor: colors }),
						...(tags.length > 0 && { productTags: tags }),
					},
				},
			});
			toastSmallSuccess('Created!', 800);
			setAddOpen(false);
			setAddForm({ ...EMPTY_FORM });
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = async (getFinalImages: () => Promise<string[]>) => {
		if (!editTarget) return;
		setSubmitting(true);
		try {
			const finalImages = await getFinalImages();
			const colors = parseArr(editForm.productColor as string);
			const tags = parseArr(editForm.productTags as string);
			const input: any = { _id: editTarget._id };
			if (editForm.productName.trim() !== editTarget.productName) input.productName = editForm.productName.trim();
			if (editForm.productDesc.trim() !== editTarget.productDesc) input.productDesc = editForm.productDesc.trim();
			if (editForm.productBrand.trim() !== editTarget.productBrand) input.productBrand = editForm.productBrand.trim();
			if (editForm.productCategory !== editTarget.productCategory) input.productCategory = editForm.productCategory;
			if (editForm.productDressStyle !== editTarget.productDressStyle)
				input.productDressStyle = editForm.productDressStyle;
			if (editForm.productStatus !== editTarget.productStatus) input.productStatus = editForm.productStatus;
			if (editForm.isDiscounted !== editTarget.isDiscounted) input.isDiscounted = editForm.isDiscounted;
			if (parseFloat(editForm.productPrice as string) !== editTarget.productPrice)
				input.productPrice = parseFloat(editForm.productPrice as string);
			if (parseFloat(editForm.productSalePrice as string) !== editTarget.productSalePrice)
				input.productSalePrice = parseFloat(editForm.productSalePrice as string);
			if (parseInt(editForm.productStockCount as string, 10) !== editTarget.productStockCount)
				input.productStockCount = parseInt(editForm.productStockCount as string, 10);
			if (editForm.productMaterial.trim() !== editTarget.productMaterial)
				input.productMaterial = editForm.productMaterial.trim() || undefined;
			if (JSON.stringify(editForm.productSize) !== JSON.stringify(editTarget.productSize))
				input.productSize = editForm.productSize;
			if (JSON.stringify(colors) !== JSON.stringify(editTarget.productColor)) {
				if (colors.length > 0) input.productColor = colors;
			}
			if (JSON.stringify(tags) !== JSON.stringify(editTarget.productTags)) {
				if (tags.length > 0) input.productTags = tags;
			}
			if (finalImages.length > 0 && JSON.stringify(finalImages) !== JSON.stringify(editTarget.productImages))
				input.productImages = finalImages;
			await updateProduct({ variables: { input } });
			toastSmallSuccess('Updated!', 800);
			setEditTarget(null);
			refetch();
		} catch (err: any) {
			toastErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

	const openEdit = (p: any) => {
		setEditForm({
			productName: p.productName ?? '',
			productDesc: p.productDesc ?? '',
			productCategory: p.productCategory ?? ProductCategory.TSHIRT,
			productDressStyle: p.productDressStyle ?? ProductDressStyle.CASUAL,
			productStatus: p.productStatus ?? ProductStatus.DRAFT,
			productPrice: p.productPrice ?? '',
			productSalePrice: p.productSalePrice ?? '',
			productSize: p.productSize ?? [],
			productColor: (p.productColor ?? []).join(', '),
			productMaterial: p.productMaterial ?? '',
			productBrand: p.productBrand ?? '',
			productStockCount: p.productStockCount ?? '0',
			productTags: (p.productTags ?? []).join(', '),
			isDiscounted: p.isDiscounted ?? false,
		});
		setEditTarget(p);
	};

	const filtered = products.filter(
		(p) =>
			search === '' ||
			p.productName?.toLowerCase().includes(search.toLowerCase()) ||
			p.productBrand?.toLowerCase().includes(search.toLowerCase()),
	);
	const totalPages = Math.ceil(total / LIMIT);

	return (
		<div className="admin-section">
			<div className="ap-page-header">
				<div>
					<h1 className="ap-page-header__title">Products</h1>
					<p className="ap-page-header__sub">
						Manage your product catalog{total > 0 && <span className="ap-page-header__accent"> · {total} items</span>}
					</p>
				</div>
				<button className="ap-btn ap-btn--primary ap-btn--md" onClick={() => setAddOpen(true)}>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
					>
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					Add Product
				</button>
			</div>

			<div className="ap-toolbar">
				<div className="ap-search">
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input
						className="ap-search__input"
						type="text"
						placeholder="Search products..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					{search && (
						<button className="ap-search__clear" onClick={() => setSearch('')}>
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					)}
				</div>
				<div className="ap-toolbar__filters">
					<select
						className="ap-filter-select"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
					>
						<option value="">All Statuses</option>
						{Object.values(ProductStatus).map((s) => (
							<option key={s} value={s}>
								{STATUS_META[s].label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="ap-table-card">
				{loading ? (
					<div className="ap-skeleton">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="ap-skeleton__row" style={{ animationDelay: `${i * 0.06}s` }} />
						))}
					</div>
				) : (
					<div className="ap-table-scroll">
						<table className="ap-table">
							<thead>
								<tr>
									<th>Product</th>
									<th>Category</th>
									<th>Price</th>
									<th>Stock</th>
									<th>Views</th>
									<th>Sales</th>
									<th>Status</th>
									<th>Created</th>
									<th style={{ textAlign: 'right' }}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{filtered.length === 0 ? (
									<tr>
										<td colSpan={9}>
											<div className="ap-empty">
												<div className="ap-empty__icon">
													<svg
														width="32"
														height="32"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
													</svg>
												</div>
												<p className="ap-empty__title">{search ? `No results for "${search}"` : 'No products yet'}</p>
												<p className="ap-empty__sub">
													{search ? 'Try a different search term' : 'Click "Add Product" to get started'}
												</p>
											</div>
										</td>
									</tr>
								) : (
									filtered.map((p) => (
										<tr key={p._id} className="ap-table__row">
											<td>
												<div className="ap-product-cell">
													<div className="ap-product-cell__img-wrap">
														<img
															src={
																p.productImages?.[0]
																	? `${NEXT_PUBLIC_API_URL}/${p.productImages[0]}`
																	: '/img/default.png'
															}
															alt={p.productName}
															className="ap-product-cell__img"
														/>
													</div>
													<div className="ap-product-cell__info">
														<span className="ap-product-cell__name">{p.productName}</span>
														<span className="ap-product-cell__brand">{p.productBrand}</span>
													</div>
												</div>
											</td>
											<td>
												<span className="ap-cat-cell">{p.productCategory}</span>
												<span className="ap-cat-cell__style">{p.productDressStyle}</span>
											</td>
											<td>
												<p className="ap-price-cell">{fp(p.productPrice)}</p>
												{p.isDiscounted && p.productSalePrice && (
													<p className="ap-price-cell__sale">{fp(p.productSalePrice)}</p>
												)}
											</td>
											<td>
												<span className={`ap-num-cell ${p.productStockCount === 0 ? 'ap-num-cell--zero' : ''}`}>
													{p.productStockCount}
												</span>
											</td>
											<td>
												<span className="ap-num-cell">{p.productViews}</span>
											</td>
											<td>
												<span className="ap-num-cell">{p.productSales}</span>
											</td>
											<td>
												<div className="ao-select-wrap">
													<StatusChip status={p.productStatus} />
													<select
														className="ao-select-overlay"
														value={p.productStatus}
														onChange={(e) => handleStatusChange(p._id, e.target.value as ProductStatus)}
													>
														{Object.values(ProductStatus).map((s) => (
															<option key={s} value={s}>
																{STATUS_META[s].label}
															</option>
														))}
													</select>
												</div>
											</td>
											<td>
												<span className="ap-date-cell">{fd(p.createdAt)}</span>
											</td>
											<td>
												<div className="ap-row-actions">
													<button className="ap-row-btn ap-row-btn--edit" onClick={() => openEdit(p)}>
														<svg
															width="13"
															height="13"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
															<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
														</svg>
														Edit
													</button>
													<button className="ap-row-btn ap-row-btn--delete" onClick={() => setDeleteTarget(p._id)}>
														<svg
															width="13"
															height="13"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<polyline points="3 6 5 6 21 6" />
															<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
															<path d="M10 11v6" />
															<path d="M14 11v6" />
														</svg>
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{totalPages > 1 && (
				<div className="ap-pagination">
					<button className="ap-pagination__nav" disabled={page === 1} onClick={() => setPage(page - 1)}>
						← Prev
					</button>
					<div className="ap-pagination__pages">
						{[...Array(totalPages)].map((_, i) => (
							<button
								key={i}
								className={`ap-pagination__page ${page === i + 1 ? 'ap-pagination__page--active' : ''}`}
								onClick={() => setPage(i + 1)}
							>
								{i + 1}
							</button>
						))}
					</div>
					<button className="ap-pagination__nav" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
						Next →
					</button>
				</div>
			)}

			{addOpen && (
				<Modal title="Add New Product" onClose={() => setAddOpen(false)}>
					<ProductForm
						form={addForm}
						onChange={setAddForm}
						onSubmit={handleAdd}
						onClose={() => setAddOpen(false)}
						submitLabel="Create Product"
						loading={submitting}
						existingImages={[]}
						isEdit={false}
					/>
				</Modal>
			)}
			{editTarget && (
				<Modal title="Edit Product" onClose={() => setEditTarget(null)}>
					<ProductForm
						form={editForm}
						onChange={setEditForm}
						onSubmit={handleEdit}
						onClose={() => setEditTarget(null)}
						submitLabel="Save Changes"
						loading={submitting}
						existingImages={editTarget.productImages ?? []}
						isEdit={true}
					/>
				</Modal>
			)}
			{deleteTarget && <ConfirmDelete onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}
		</div>
	);
};

export default withAdminLayout(AdminProducts);
