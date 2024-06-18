const fs = require('fs').promises;
import path = require("path");

export class DeleteFileService {

    static async deleteimage(fileName) {
        const directoryPath = 'public/Avtar/'
        const filePath = path.join(directoryPath, fileName);

        try {
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
                await fs.unlink(filePath);
                console.log(`Successfully deleted ${fileName}`);
            } else {
                console.error(`Path ${filePath} is not a file`);
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.error(`File ${fileName} not found`);
            } else {
                console.error(`Error deleting ${fileName}`, err);
            }
        }
    }
}