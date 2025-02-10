import fs from "fs";
import path from "path";

// Función para crear una carpeta si no existe
export function createFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Carpeta creada: ${folderPath}`);
    }
}

// Función para escribir un archivo
export function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content.trim());
    console.log(`Archivo creado: ${filePath}`);
}
