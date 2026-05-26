import { Seeder } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Menu } from "../../entities/Menu";

export default class MenuSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Menu);

        // Menús padre primero (sin menuPadre)
        const menusPadre = [
            { codigo_menu: 'M001', url_menu: '/dashboard',   nombre_menu: 'Dashboard'   },
            { codigo_menu: 'M002', url_menu: '/comunidad',   nombre_menu: 'Comunidad'   },
            { codigo_menu: 'M003', url_menu: '/economia',    nombre_menu: 'Economía'    },
            { codigo_menu: 'M004', url_menu: '/seguridad',   nombre_menu: 'Seguridad'   },
            { codigo_menu: 'M005', url_menu: '/puntualidad', nombre_menu: 'Puntualidad' },
        ];

        console.log("🌱 Insertando menús padre...");
        for (const m of menusPadre) {
            const existe = await repo.findOne({ where: { codigo_menu: m.codigo_menu } });
            if (!existe) {
                await repo.save(repo.create(m));
                console.log(`✅ Menú: ${m.nombre_menu}`);
            }
        }

        // Menús hijo (con menuPadre)
        const menusHijo = [
            { codigo_menu: 'M011', url_menu: '/dashboard/conductor',             nombre_menu: 'Panel Conductor', padre: 'M001' },
            { codigo_menu: 'M012', url_menu: '/dashboard/pasajero',              nombre_menu: 'Panel Pasajero',  padre: 'M001' },
            { codigo_menu: 'M021', url_menu: '/conductores',                     nombre_menu: 'Conductores',     padre: 'M002' },
            { codigo_menu: 'M022', url_menu: '/pasajeros',                       nombre_menu: 'Pasajeros',       padre: 'M002' },
            { codigo_menu: 'M031', url_menu: '/dashboard/admin/usuarios',        nombre_menu: 'Solicitudes',      padre: 'M001' },
            { codigo_menu: 'M032', url_menu: '/dashboard/admin/roles',           nombre_menu: 'Roles',            padre: 'M001' },
            { codigo_menu: 'M033', url_menu: '/dashboard/admin/estados',         nombre_menu: 'Estados',          padre: 'M001' },
            { codigo_menu: 'M034', url_menu: '/dashboard/admin/perfiles',        nombre_menu: 'Perfiles',         padre: 'M001' },
            { codigo_menu: 'M035', url_menu: '/dashboard/admin/menus',           nombre_menu: 'Menús',            padre: 'M001' },
            { codigo_menu: 'M036', url_menu: '/dashboard/admin/universidades',   nombre_menu: 'Universidades',    padre: 'M001' },
            { codigo_menu: 'M037', url_menu: '/dashboard/admin/permisos',        nombre_menu: 'Permisos Menú',    padre: 'M001' },
            //{ codigo_menu: 'M038', url_menu: '/dashboard/admin/solicitudes',     nombre_menu: 'Solicitudes',      padre: 'M001' },
            { codigo_menu: 'M038', url_menu: '/dashboard/admin/administradores', nombre_menu: 'Administradores',  padre: 'M001' },
        ];

        console.log("🌱 Insertando menús hijo...");
        for (const m of menusHijo) {
            const existe = await repo.findOne({ where: { codigo_menu: m.codigo_menu } });
            if (!existe) {
                const padre = await repo.findOne({ where: { codigo_menu: m.padre } });
                await repo.save(repo.create({ ...m, menuPadre: padre! }));
                console.log(`✅ Submenú: ${m.nombre_menu}`);
            }
        }
    }
}