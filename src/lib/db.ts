import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";
import InitSeeder        from "../db/seeds/init.estadorol";
import PerfilSeeder      from "../db/seeds/perfil.seeder";
import UniversidadSeeder from "../db/seeds/universidad.seeder";
import MenuSeeder        from "../db/seeds/menu.seeder";
import MenuPermisoSeeder from "../db/seeds/MenuPermiso.seeder";
import UsuarioSeeder     from "../db/seeds/usuario.seeder";

// --- IMPORTACIÓN DE ENTIDADES ---
import { CalificacionConductor }  from "../entities/CalificacionConductor";
import { CalificacionEstudiante } from "../entities/CalificacionEstudiante";
import { Conductor }              from "../entities/Conductor";
import { Estado }                 from "../entities/Estado"; 
import { Menu }                   from "../entities/Menu";
import { MenuPermiso }            from "../entities/Menu_permiso";
import { Parada }                 from "../entities/Parada";
import { Perfil }                 from "../entities/Perfil";
import { Reserva }                from "../entities/Reserva";
import { Rol }                    from "../entities/Rol";
import { RutaConductor }          from "../entities/RutaConductor";
import { Universidad }            from "../entities/Universidad";
import { UniversidadEstudiante }  from "../entities/UniversidadEstudiante";
import { Usuario }                from "../entities/Usuario"; 
import { Vehiculo }               from "../entities/Vehiculo";
import { Viaje }                  from "../entities/Viaje";

const options: DataSourceOptions & SeederOptions = {
    type: "oracle",
    host: "localhost",
    port: 1521,
    username: "us_fastdrive1",
    password: "123",
    sid: "xe",
    synchronize: false,
    logging: false,
    entities: [
        CalificacionConductor,
        CalificacionEstudiante,
        Conductor,
        Estado,
        Menu,
        MenuPermiso,
        Parada,
        Perfil,
        Reserva,
        Rol,
        RutaConductor,
        Universidad,
        UniversidadEstudiante,
        Usuario,
        Vehiculo,
        Viaje
    ],
    seeds: [
        InitSeeder,
        PerfilSeeder,
        UniversidadSeeder,
        MenuSeeder,
        MenuPermisoSeeder,
        UsuarioSeeder,
    ]
};

export const AppDataSource = new DataSource(options);

let initialized = false;

export async function getDataSource() {
    if (!initialized) {
        try {
            if (AppDataSource.isInitialized) {
                initialized = true;
                return AppDataSource;
            }
            await AppDataSource.initialize();
            initialized = true;
            console.log("¡Conexión con Oracle establecida!");
        } catch (error: any) {
            if (error.message?.includes("already established")) {
                initialized = true;
                return AppDataSource;
            }
            throw error;
        }
    }
    return AppDataSource;
}