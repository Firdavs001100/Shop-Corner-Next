import toast from 'react-hot-toast';
import { Messages } from './config';

/* ==============================
   Error Handling
============================== */

export const toastErrorHandling = (err: any) => {
	const message = err?.graphQLErrors?.[0]?.message || err?.response?.data?.message || err?.message || Messages.error1;

	toast.error(message, { duration: 3000 });
};

export const toastErrorHandlingForAdmin = (err: any) => {
	const message = err?.message ?? Messages.error1;
	toast.error(message, { duration: 3000 });
};

export const toastError = (msg: string, duration: number = 3000) => {
	toast.error(msg, { duration });
};

/* ==============================
   Success Alerts
============================== */

export const toastSuccess = (msg: string, duration: number = 2000) => {
	toast.success(msg.replace('Definer: ', ''), { duration });
};

export const toastSmallSuccess = (msg: string, duration: number = 2000, enableForward: boolean = false) => {
	toast.success(msg, { duration });

	if (enableForward) {
		setTimeout(() => {
			window.location.reload();
		}, duration);
	}
};

/* ==============================
   Confirmation 
============================== */

export const toastConfirm = (msg: string): Promise<boolean> => {
	return new Promise((resolve) => {
		toast(
			(t) => (
				<div style={{ textAlign: 'center' }}>
					<p style={{ marginBottom: '10px' }}>{msg}</p>
					<div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
						<button
							onClick={() => {
								toast.dismiss(t.id);
								resolve(true);
							}}
							style={{
								backgroundColor: '#e92C28',
								color: '#fff',
								border: 'none',
								padding: '6px 12px',
								borderRadius: '6px',
								cursor: 'pointer',
							}}
						>
							Confirm
						</button>

						<button
							onClick={() => {
								toast.dismiss(t.id);
								resolve(false);
							}}
							style={{
								backgroundColor: '#bdbdbd',
								color: '#000',
								border: 'none',
								padding: '6px 12px',
								borderRadius: '6px',
								cursor: 'pointer',
							}}
						>
							Cancel
						</button>
					</div>
				</div>
			),
			{ duration: Infinity },
		);
	});
};

/* ==============================
   Login Confirm
============================== */

export const toastLoginConfirm = (msg: string): Promise<boolean> => {
	return new Promise((resolve) => {
		let settled = false;

		const safeResolve = (value: boolean) => {
			if (!settled) {
				settled = true;
				resolve(value);
			}
		};

		toast(
			(t) => (
				<div style={{ textAlign: 'center', minWidth: '220px' }}>
					<p style={{ marginBottom: '12px', fontSize: '14px' }}>{msg}</p>

					<div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
						{/* Cancel */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								toast.dismiss(t.id);
								safeResolve(false);
							}}
							style={{
								backgroundColor: '#eee',
								color: '#333',
								border: 'none',
								padding: '6px 14px',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '13px',
								transition: '0.2s',
							}}
							onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ddd')}
							onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#eee')}
						>
							Cancel
						</button>

						{/* Login */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								toast.dismiss(t.id);
								safeResolve(true);
							}}
							style={{
								backgroundColor: '#e92C28',
								color: '#fff',
								border: 'none',
								padding: '6px 14px',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '13px',
								transition: '0.2s',
							}}
							onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c62828')}
							onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e92C28')}
						>
							Login
						</button>
					</div>
				</div>
			),
			{
				duration: Infinity,
				style: {
					padding: '14px 16px',
					borderRadius: '10px',
				},
			},
		);
	});
};

/* ==============================
   Basic & Custom
============================== */

export const toastBasic = (text: string, duration: number = 2000) => {
	toast(text, { duration });
};

export const toastContact = (msg: string, duration: number = 10000) => {
	toast(msg, {
		icon: '📩',
		duration,
		style: { minWidth: '220px', textAlign: 'center' },
	});
};
