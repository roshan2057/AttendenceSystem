import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity("position")
export class PositionEntity{
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column({ nullable: true })
    position: string;

    @OneToMany(() => UserEntity, user => user.position)
    users: UserEntity[];
}