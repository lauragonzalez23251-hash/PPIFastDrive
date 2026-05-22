import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Universidad } from "./Universidad";
import { Usuario } from "./Usuario";
import { Estado } from "./Estado";

@Entity("UNIVERSIDAD_ESTUDIANTE")
export class UniversidadEstudiante {

    // --- CLAVE PRIMARIA COMPUESTA ---
    @PrimaryColumn({ type: "varchar2", length: 20, name: "NIT_UNI" })
    nit_uni!: string;

    @PrimaryColumn({ type: "number", name: "ID_USER" })
    id_user!: number;

    // --- COLUMNAS ESTÁNDAR ---
    @Column({ type: "varchar2", length: 120, nullable: false, name: "CORREO_INSTITUCIONAL_UNE" })
    correo_institucional_une!: string;

    @Column({ type: "blob", nullable: true, name: "CERTIFICADO_ESTUDIO_UNE" })
    certificado_estudio_une!: Buffer; // Los BLOB se manipulan como instancias de Buffer en Node.js/TS

    // --- LLAVES FORÁNEAS QUE MAPEAN LAS RELACIONES ---

    @ManyToOne(() => Universidad, { nullable: false })
    @JoinColumn({ name: "NIT_UNI" })
    universidad!: Universidad;

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "ID_USER" })
    usuario!: Usuario;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "ID_ESTADO" })
    estado!: Estado;
}