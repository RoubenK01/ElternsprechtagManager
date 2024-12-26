const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let availableTimeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"];
let bookings = [];
const workbook = new ExcelJS.Workbook();
const filePath = path.join(__dirname, 'bookings.xlsx');

// Load the workbook when the server starts
async function loadWorkbook() {
    try {
        await workbook.xlsx.readFile(filePath);
    } catch (error) {
        // If the file does not exist, create a new workbook and worksheet
        const worksheet = workbook.addWorksheet('Bookings');
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Time Slot', key: 'timeSlot', width: 20 }
        ];
        await workbook.xlsx.writeFile(filePath);
    }
}

loadWorkbook();

app.get('/availableTimeSlots', (req, res) => {
    res.json(availableTimeSlots);
});

app.post('/bookTimeSlot', async (req, res) => {
    const { name, timeSlot } = req.body;
    if (availableTimeSlots.includes(timeSlot)) {
        bookings.push({ name, timeSlot });
        availableTimeSlots = availableTimeSlots.filter(slot => slot !== timeSlot);
        await saveToExcel(name, timeSlot);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

async function saveToExcel(name, timeSlot) {
    let worksheet = workbook.getWorksheet('Bookings');
    if (!worksheet) {
        worksheet = workbook.addWorksheet('Bookings');
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Time Slot', key: 'timeSlot', width: 20 }
        ];
    }

    worksheet.addRow({ name, timeSlot });
    await workbook.xlsx.writeFile(filePath);
}

// Handle server shutdown
async function handleShutdown() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(__dirname, `bookings-${timestamp}.xlsx`);

    try {
        await fs.copy(filePath, backupFilePath);
        await fs.remove(filePath);
        console.log(`Backup created at ${backupFilePath} and original file deleted.`);
    } catch (error) {
        console.error('Error during shutdown:', error);
    }
}

process.on('SIGINT', async () => {
    console.log('Server is shutting down...');
    await handleShutdown();
    process.exit();
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});