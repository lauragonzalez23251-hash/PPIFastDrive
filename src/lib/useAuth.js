'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuth(rolesPermitidos = []) {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [idRol, setIdRol] = useState(null);
    const [listo, setListo] = useState(false);

    useEffect(() => {
        const userId   = localStorage.getItem('userId');
        const userRol  = parseInt(localStorage.getItem('userRol'));
        const userName = localStorage.getItem('userName');

        if (!userId) {
            router.push('/login');
            return;
        }

        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(userRol)) {
            router.push('/login');
            return;
        }

        setNombre(userName || 'Usuario');
        setIdRol(userRol);
        setListo(true);
    }, [router]);

    function cerrarSesion() {
        localStorage.clear();
        router.push('/login');
    }

    return { nombre, idRol, listo, cerrarSesion };
}