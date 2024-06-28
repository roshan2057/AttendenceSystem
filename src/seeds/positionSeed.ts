import { AppDataSource } from "../data-source";
import { PositionEntity } from "../entity/Position.entity";

export class PositionSeed {
  static async insert() {
    const positionsToInsert = [
      { name: "Admin" },
      { name: "Human Resources" },
      { name: "Management" },
      { name: "App Developer" },
      { name: "Backend Developer" },
      { name: "Intern" },
      { name: "Frontend Developer" },
      { name: "Quality Assurance" },
    ];
    const positonRepository = AppDataSource.getRepository(PositionEntity);

    const get = await positonRepository.find();
    let adminId = ``;
    if (get.length == 0) {
      await Promise.all(
        positionsToInsert.map(async (positionData) => {
          const position = new PositionEntity();
          position.position = positionData.name;
          const save = await positonRepository.save(position);
          if (save.position == "Admin") {
            adminId = save.id;
          }
        })
      );
      return adminId;
    }
    return;
  }
}
