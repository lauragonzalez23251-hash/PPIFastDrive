'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useAdminAuth() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [listo, setListo] = useState(false);

    useEffect(() => {
        const userId  = localStorage.getItem('userId');
        const userRol = localStorage.getItem('userRol');

        if (!userId || !userRol || userRol !== '1') {
            router.push('/login');
            return;
        }
        setNombre(localStorage.getItem('userName') || 'Administrador');
        setListo(true);
    }, [router]);

    return { nombre, listo };
}