import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { POSITION_ENUM } from "../common/common.enum";
import { AttendanceLogEntity } from "./AttendanceLog.entity";

@Entity({ name: "user" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: "user" })
  role: string;

  @Column({ nullable: true })
  cardId: string;

  @Column({ nullable:true })
  position: string;

  @Column({ type: String, nullable:true })
  phone: string;

  @Column({ nullable: true })
  dob: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  profileUrl: string;

  @Column({ nullable: true })
  gender: string;

  @OneToMany(() => AttendanceLogEntity, (user) => user.user, {
    cascade: true
  })
  log: AttendanceLogEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}