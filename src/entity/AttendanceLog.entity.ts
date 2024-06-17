import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./User.entity";


@Entity({ name: "log" })
export class AttendanceLogEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ type: 'date', nullable: false })
    date: string;

    @ManyToOne(() => UserEntity, (user) => user.log)
    user: UserEntity;

    @Column({ type: 'time', nullable: true })
    time1: string;

    @Column({ type: 'time', nullable: true })
    time2: string;

    @Column({ type: 'time', nullable: true })
    break: string;

    @Column({ type: 'time', nullable: true })
    time3: string;

    @Column({ type: 'time', nullable: true })
    time4: string;

    @Column({ type: 'time', nullable: true })
    total: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated: Date;
}