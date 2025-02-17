import path from "path";
import { writeFile } from "./fileUtils.js";

export function writeEnvFile(database, orm) {
    const envPath = path.resolve(".env"); // Usa path.resolve
    let envContent = "PORT=3000\n";

    switch (database) {
        case "MongoDB":
            envContent += "MONGODB_URI=mongodb://localhost:27017/mydatabase\n";
            break;
        case "MySQL":
            if (orm === "Sequelize") {
                envContent += "MYSQL_URI=mysql://root:@localhost:3306/mydatabase\n";
            } else {
                envContent += "MYSQL_HOST=localhost\n";
                envContent += "MYSQL_USER=root\n";
                envContent += "MYSQL_PASSWORD=\n";
                envContent += "MYSQL_DATABASE=mydatabase\n";
            }
            break;
        case "PostgreSQL":
            if (orm === "Sequelize" || orm === "TypeORM") {
                envContent += "PG_URI=postgres://postgres:@localhost:5432/mydatabase\n";
            } else {
                envContent += "PGUSER=postgres\n";
                envContent += "PGHOST=localhost\n";
                envContent += "PGDATABASE=mydatabase\n";
                envContent += "PGPASSWORD=\n";
                envContent += "PGPORT=5432\n";
            }
            break;
        case "SQLite":
            envContent += "SQLITE_PATH=./database.sqlite\n";
            break;
    }

    writeFile(envPath, envContent);
}

export function writeDbFile(useTypeScript, database) {
    const ext = useTypeScript ? ".ts" : ".js";
    const dbPath = path.resolve("src", `db${ext}`); // Usa path.resolve

    let dbContent = "";

    switch (database) {
        case "MongoDB":
            dbContent = `
import mongoose from 'mongoose';
import { config } from './config.js';

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(config.mongodbUri);
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
    }
};
            `.trim();
            break;

        case "MySQL":
            dbContent = `
import mysql from 'mysql2';
import { config } from './config.js';

export const connection = mysql.createConnection({
    host: config.mysqlHost,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDatabase
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
    } else {
        console.log('MySQL conectado');
    }
});
            `.trim();
            break;

        case "PostgreSQL":
            dbContent = `
import { Pool } from 'pg';
import { config } from './config.js';

export const pool = new Pool({
    user: config.pgUser,
    host: config.pgHost,
    database: config.pgDatabase,
    password: config.pgPassword,
    port: config.pgPort
});

pool.on('connect', () => {
    console.log('PostgreSQL conectado');
});
            `.trim();
            break;

        case "SQLite":
            dbContent = `
import sqlite3 from 'sqlite3';
import { config } from './config.js';

export const db = new sqlite3.Database(config.sqlitePath, (err) => {
    if (err) {
        console.error('Error conectando a SQLite:', err);
    } else {
        console.log('SQLite conectado');
    }
});
            `.trim();
            break;
    }

    writeFile(dbPath, dbContent);
}

export function generateMvcFiles(basePath, useTypeScript) {
    const ext = useTypeScript ? ".ts" : ".js";
    const srcPath = path.resolve(basePath, "src");

    // Controlador de ejemplo
    const controllerContent = `
    export const exampleController = (req, res) => {
        res.send('¡Hola desde el controlador de ejemplo!');
    };
    `.trim();
    writeFile(path.resolve(srcPath, "controllers", `example.controller${ext}`), controllerContent);

    // Modelo de ejemplo (usando MongoDB como base)
    const modelContent = `
import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
    name: String,
    age: Number,
});

export const Example = mongoose.model('Example', exampleSchema);
    `.trim();
    writeFile(path.resolve(srcPath, "models", `example.model${ext}`), modelContent);

    // Ruta de ejemplo
    const routeContent = `
    import { Router } from 'express';
    import { exampleController } from '../controllers/example.controller${ext.slice(0, -3)}';

    const router = Router();
    router.get('/example', exampleController);

    export default router;
    `.trim();
    writeFile(path.resolve(srcPath, "routes", `example.route${ext}`), routeContent);
}

export function writeConfigFile(useTypeScript, database) {
    const ext = useTypeScript ? ".ts" : ".js";
    const configPath = path.resolve("src", "config", `config${ext}`); // Guardar en src/config

    const content = `
import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    ${getDatabaseConfig(database)}
};
    `.trim();

    writeFile(configPath, content);
}

function getDatabaseConfig(database, orm) {
    switch (database) {
        case "MongoDB":
            return "mongodbUri: process.env.MONGODB_URI,";
        case "MySQL":
            return orm === "Sequelize" ? "mysqlUri: process.env.MYSQL_URI," : `
                mysqlHost: process.env.MYSQL_HOST,
                mysqlUser: process.env.MYSQL_USER,
                mysqlPassword: process.env.MYSQL_PASSWORD,
                mysqlDatabase: process.env.MYSQL_DATABASE,`;
        case "PostgreSQL":
            return orm === "Sequelize" || orm === "TypeORM" ? "pgUri: process.env.PG_URI," : `
                pgUser: process.env.PGUSER,
                pgHost: process.env.PGHOST,
                pgDatabase: process.env.PGDATABASE,
                pgPassword: process.env.PGPASSWORD,
                pgPort: parseInt(process.env.PGPORT || '5432'),`;
        case "SQLite":
            return "sqlitePath: process.env.SQLITE_PATH,";
        default:
            return "";
    }
}