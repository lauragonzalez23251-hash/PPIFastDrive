import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { Perfil } from "@/entities/Perfil";
import { Estado } from "@/entities/Estado";
import { Universidad } from "@/entities/Universidad";
import { UniversidadEstudiante } from "@/entities/UniversidadEstudiante";
import * as bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const dataSource = await getDataSource();

        const perfilRepo  = dataSource.getRepository(Perfil);
        const estadoRepo  = dataSource.getRepository(Estado);
        const usuarioRepo = dataSource.getRepository(Usuario);
        const uniRepo     = dataSource.getRepository(Universidad);
        const uniEstRepo  = dataSource.getRepository(UniversidadEstudiante);

        // --- PASO 1: Validar dominio del correo (solo pasajeros y mixtos) ---
        if (body.idRol === 3 || body.idRol === 4) {
            const universidad = await uniRepo.findOne({ where: { nit_uni: body.nitUni } });

            if (!universidad) {
                return NextResponse.json({ error: "Universidad no encontrada" }, { status: 400 });
            }

            const dominioCorreo = body.email.split('@')[1];
            if (!dominioCorreo || dominioCorreo !== universidad.dominio_correo_uni) {
                return NextResponse.json({
                    error: `El correo debe ser institucional. Dominio requerido: @${universidad.dominio_correo_uni}`
                }, { status: 400 });
            }
        }

        // --- PASO 2: Buscar el perfil según rol y universidad ---
        let nombrePerfil = '';
        if (body.idRol === 2) {
            nombrePerfil = 'ConductorCarro';
        } else {
            const mapaUniversidad: Record<string, string> = {
                ' 890.980.136-6': 'Poli',
                '800.036.781-1':  'María Cano',
                ' 890.980.040-8': 'UdeA',
                '899.999.034-1':  'SENA',
                '890980040-5':    'UNAL',
                '890.905.419-6':  'TdeA',
                '890.980.153-1':  'Pascual',
                '800.116.217-2':  'Uniminuto',
            };
            const uniCorta = mapaUniversidad[body.nitUni] || '';
            nombrePerfil = body.idRol === 4
                ? `Mixto ${uniCorta}`
                : `Estudiante ${uniCorta}`;
        }

        const perfil = await perfilRepo.findOne({ where: { nombre_perfil: nombrePerfil } });
        if (!perfil) {
            return NextResponse.json({ error: `Perfil '${nombrePerfil}' no encontrado` }, { status: 400 });
        }

        // --- PASO 3: Buscar estados iniciales ---
        const estadoCuenta = await estadoRepo.findOne({
            where: { nombre_estado: 'PENDIENTE', categoria: 'VERIFICACION' }
        });
        const estadoVerificacion = await estadoRepo.findOne({
            where: { nombre_estado: 'Pendiente', categoria: 'CONDUCTOR' }
        });

        if (!estadoCuenta) {
            return NextResponse.json({ error: "Estado PENDIENTE no encontrado" }, { status: 400 });
        }

        // --- PASO 4: Encriptar contraseña ---
        const contrasena = await bcrypt.hash(body.password, 10);

        // --- PASO 5: Crear y guardar usuario ---
        const nuevoUsuario = usuarioRepo.create({
            nombre_user:              body.nombre,
            primer_apellido:          body.primerApellido,
            segundo_apellido:         body.segundoApellido,
            documento_identidad_user: body.documento,
            celular:                  body.celular,
            fecha_nacimiento_user:    new Date(body.fechaNac),
            correo_personal_user:     body.email,
            contrasena,
            perfil,
            estadoCuenta,
            estadoVerificacion: estadoVerificacion || undefined,
        });

        const usuarioGuardado = await usuarioRepo.save(nuevoUsuario);
        console.log("Usuario guardado con ID:", usuarioGuardado.id_user);

        // --- PASO 6: Vincular estudiante/mixto con su universidad ---
        if (body.idRol === 3 || body.idRol === 4) {
            const vinculacion = uniEstRepo.create({
                nit_uni:                  body.nitUni,
                id_user:                  usuarioGuardado.id_user,
                correo_institucional_une: body.email,
                universidad:              { nit_uni: body.nitUni } as any,
                usuario:                  usuarioGuardado,
                estado:                   estadoCuenta,
            });
            await uniEstRepo.save(vinculacion);
        }

        return NextResponse.json({
            message: "Usuario registrado con éxito, pendiente de aprobación",
            userId:  usuarioGuardado.id_user
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error en el registro:", error);

        let mensajeError = "Error al registrar el usuario";
        if (error.errorNum === 1 || error.code === 'ORA-00001') {
            if (error.message?.includes('UK_CORREO_USER')) {
                mensajeError = "El correo ya está registrado.";
            } else if (error.message?.includes('UK_DOC_USER')) {
                mensajeError = "El documento ya está registrado.";
            } else if (error.message?.includes('UK_CELULAR_USER')) {
                mensajeError = "El celular ya está registrado.";
            }
        }

        return NextResponse.json({ error: mensajeError }, { status: 500 });
    }
}