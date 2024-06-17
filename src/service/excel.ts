const ExcelJS = require('exceljs');
export class Excel {
    static async ExportToExcel(filename,headers, data, res) {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');
            worksheet.addRow(headers);
            worksheet.addRows(data);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
            await workbook.xlsx.write(res);

            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).send('Error generating Excel file');
        }

    }
}