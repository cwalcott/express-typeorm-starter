import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar', { length: 100 })
  name!: string

  @Column('varchar', { unique: true, length: 255 })
  email!: string

  @Column('integer', { nullable: true })
  age?: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}