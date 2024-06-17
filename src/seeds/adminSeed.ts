import { AppDataSource } from "../data-source";
import { UserEntity } from "../entity/User.entity";
import { encrypt } from "../helpers/encrypt";

export class AdminSeed {
    static async insert() {

        const isAdmin = await AppDataSource.getRepository(UserEntity).findOne({ where: { role: 'admin' } });
        if (!isAdmin) {
            const encryptedPassword = await encrypt.encryptpass('password');
            const user = new UserEntity();
            user.name = "admin";
            user.email = "admin@gmail.com";
            user.password = encryptedPassword;
            user.role = 'admin';

            const userRepository = AppDataSource.getRepository(UserEntity);
            const save = await userRepository.save(user);
            return
        }
        return
    }
}