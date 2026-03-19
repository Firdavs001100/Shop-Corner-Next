import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';

const AdminIndex: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		router.push('/_admin/dashboard');
	}, []);

	return <></>;
};

export default withAdminLayout(AdminIndex);
