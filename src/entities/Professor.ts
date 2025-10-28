import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('professores')
export class Professor {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nome: string

    @Column()
    materia: string
}