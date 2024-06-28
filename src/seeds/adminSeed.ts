import { AppDataSource } from "../data-source";
import { UserEntity } from "../entity/User.entity";
import { encrypt } from "../helpers/encrypt";

export class AdminSeed {
    static async insert(adminId) {

        const isAdmin = await AppDataSource.getRepository(UserEntity).findOne({ where: { role: 'admin' } });
        if (!isAdmin) {
            const encryptedPassword = await encrypt.encryptpass('Password@123');
            const user = new UserEntity();
            user.name = "Admin";
            user.email = "admin@gmail.com";
            user.password = encryptedPassword;
            user.role = 'admin';
            user.position=adminId;

            const userRepository = AppDataSource.getRepository(UserEntity);
            const save = await userRepository.save(user);
            return
        }
        return
    }
}