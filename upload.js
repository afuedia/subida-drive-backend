const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configurar almacenamiento temporal
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');  // 'file' es el nombre del campo de archivo en tu formulario

// Crear servicio de Google Drive
const drive = google.drive('v3');

// Función para subir archivo a Google Drive
const uploadFileToDrive = async (file) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../config/google-credentials.json'),
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    const fileMetadata = {
        name: file.originalname, // Nombre del archivo
        parents: ['ID_DE_TU_CARPETA'], // Aquí pon el ID de tu carpeta de Google Drive
    };

    const media = {
        mimeType: file.mimetype,
        body: file.buffer,
    };

    try {
        const res = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        return res.data.id;
    } catch (error) {
        console.error('Error al subir el archivo: ', error);
        throw error;
    }
};

// API endpoint de subida de archivos
module.exports = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send('Error al cargar el archivo');
        }
        try {
            const fileId = await uploadFileToDrive(req.file);
            res.status(200).send(`Archivo subido exitosamente con ID: ${fileId}`);
        } catch (error) {
            res.status(500).send('Error al procesar el archivo');
        }
    });
};
