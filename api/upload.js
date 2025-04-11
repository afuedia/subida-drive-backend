const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');

// Cargar credenciales desde variable de entorno
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

// Configurar almacenamiento temporal
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');

// Crear servicio de Google Drive
const drive = google.drive('v3');

// Función para subir archivo a Google Drive
const uploadFileToDrive = async (file) => {
    const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file'], // Puedes probar con ['https://www.googleapis.com/auth/drive']
    });

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    const fileMetadata = {
        name: file.originalname,
        parents: ['1-35sznqeDd-35dP8Okz-3Ng2vSnxKx-n'], // Asegúrate de que este ID es correcto
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
        console.error('Error completo al subir el archivo: ', JSON.stringify(error, null, 2)); // Mostramos el error detallado
        throw error;
    }
};

// API endpoint de subida de archivos
module.exports = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Error al procesar el archivo: ', err);
            return res.status(400).send('Error al cargar el archivo');
        }

        try {
            const fileId = await uploadFileToDrive(req.file);
            res.status(200).send(`Archivo subido exitosamente con ID: ${fileId}`);
        } catch (error) {
            console.error('Error al procesar el archivo: ', error.message);  // Esto muestra el error exacto
            res.status(500).send('Error al procesar el archivo: ' + error.message);
        }
    });
};

