import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { installDependencies } from "./dependencyUtils.js";
import { writePackageJson } from "./packageUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} ProjectOptions
 * @property {boolean} useTypeScript
 * @property {boolean} useMVC
 * @property {'MongoDB' | 'MySQL' | 'PostgreSQL' | 'SQLite'} database
 * @property {'Express' | 'Fastify'} framework
 * @property {boolean} installEcosystem
 * @property {'Ninguno' | 'Sequelize' | 'TypeORM'} orm
 */

/**
 * Generates project files based on provided options
 * @param {string} projectDir - Directory of the project
 * @param {ProjectOptions} options - Project configuration options
 */
function generateFiles(projectDir, options = { useTypeScript: false, useMVC: false, database: "MongoDB", framework: "Express", installEcosystem: false, orm: 'Ninguno' }) {
    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });
    process.chdir(projectDir);

    createFolderStructure(options.useMVC);
    generateBaseFiles(options.framework, options.useMVC, options.useTypeScript);
    setupDatabase(options.database, options.useTypeScript, options.orm);
    writeEnvFile(options.database);
    writeConfigFile(options.useTypeScript, options.database);
    writePackageJson(path.basename(projectDir), options.useTypeScript);
    installDependencies(options);
}

/**
 * Creates the folder structure for the project
 * @param {boolean} useMVC - Whether to use MVC structure
 */
function createFolderStructure(useMVC) {
    const folders = ["src", ...(useMVC ? ["src/controllers", "src/models", "src/routes"] : [])];
    folders.forEach(folder => fs.mkdirSync(path.resolve(folder), { recursive: true }));
}

/**
 * Generates the base files for the project
 * @param {string} framework - The framework to use
 * @param {boolean} useMVC - Whether to use MVC structure
 * @param {boolean} typescript - Whether to use TypeScript
 */
function generateBaseFiles(framework, useMVC, typescript) {
    const ext = typescript ? "ts" : "js";
    const frameworkImport = framework.toLowerCase();
    const indexContent = `
import ${frameworkImport} from '${frameworkImport}';
import { config } from './config.${ext}';
${useMVC ? `import { connectDB } from './config/db.${ext}';`.trim() : ""}

const app = ${frameworkImport}();
const PORT = config.port;

${framework === "Express" ? `
app.use(${frameworkImport}.json());
app.use(${frameworkImport}.urlencoded({ extended: true }));
`.trim() : ""}

${useMVC ? `
connectDB()
    .then(() => console.log('DB Conectada'))
    .catch(err => console.error('Error:', err));
`.trim() : ""}

app.get('/', (req, res) => {
    res.send('¡Hola desde ${framework}!');
});

app.listen(PORT, () => {
    console.log(\`Servidor ${framework} escuchando en http://localhost:\${PORT}\`);
});
`.trim();
    fs.writeFileSync(path.resolve(`src/index.${ext}`), indexContent);

    if (useMVC) {
        fs.mkdirSync(path.resolve("src/config"), { recursive: true });
        fs.writeFileSync(path.resolve(`src/config/db.${ext}`), "export const dbConfig = {};\n");
    }
}

/**
 * Sets up the database configuration
 * @param {string} database - The database to use
 * @param {boolean} typescript - Whether to use TypeScript
 * @param {string} orm - The ORM to use
 */
/**
 * Sets up the database configuration
 * @param {string} database - The database to use
 * @param {boolean} typescript - Whether to use TypeScript
 * @param {string} orm - The ORM to use
 */
export function setupDatabase(database, typescript, orm) {
    const ext = typescript ? "ts" : "js";
    let dbContent = '';

    if (orm === 'Sequelize') {
        dbContent = `
import { Sequelize } from 'sequelize';
import { config } from './config.${ext}';

export const sequelize = new Sequelize(config.databaseUrl);

sequelize.authenticate()
    .then(() => console.log('Sequelize conectado'))
    .catch(err => console.error('Error conectando a Sequelize:', err));
`.trim();
    } else if (orm === 'TypeORM') {
        dbContent = `
import "reflect-metadata";
import { DataSource } from 'typeorm';
import { config } from './config.${ext}';

export const AppDataSource = new DataSource({
    type: '${database.toLowerCase()}',
    host: config.${database === "MySQL" ? 'mysqlHost' : database === "PostgreSQL" ? 'pgHost' : 'sqlitePath'},
    port: config.${database === "MySQL" ? 'mysqlPort' : database === "PostgreSQL" ? 'pgPort' : 'sqlitePort'},
    username: config.${database === "MySQL" ? 'mysqlUser' : 'pgUser'},
    password: config.${database === "MySQL" ? 'mysqlPassword' : 'pgPassword'},
    database: config.${database === "MySQL" ? 'mysqlDatabase' : 'pgDatabase'},
    synchronize: true,
    logging: false,
    entities: [],
    migrations: [],
    subscribers: [],
});

AppDataSource.initialize()
    .then(() => {
        console.log('TypeORM conectado');
    })
    .catch((error) => console.log('Error conectando a TypeORM:', error));
`.trim();
    } else {
        dbContent = {
            MongoDB: `
import mongoose from 'mongoose';
import { config } from './config';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodbUri || '', {
        });
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
    }
};
`.trim(),
            MySQL: `
import mysql from 'mysql2';
import { config } from './config.${ext}';

export const connection = mysql.createConnection({
    host: config.mysqlHost,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDatabase,
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
    } else {
        console.log('MySQL conectado');
    }
});
`.trim(),
            PostgreSQL: `
import { Pool } from 'pg';
import { config } from './config.${ext}';

export const pool = new Pool({
    user: config.pgUser,
    host: config.pgHost,
    database: config.pgDatabase,
    password: config.pgPassword,
    port: config.pgPort,
});

pool.on('connect', () => {
    console.log('PostgreSQL conectado');
});
`.trim(),
            SQLite: `
import sqlite3 from 'sqlite3';
import { config } from './config.${ext}';

export const db = new sqlite3.Database(config.sqlitePath || ':memory:', (err) => {
    if (err) {
        console.error('Error conectando a SQLite:', err);
    } else {
        console.log('SQLite conectado');
    }
});
`.trim(),
        }[database];
    }

    fs.writeFileSync(path.resolve("src/config", `db.${ext}`), dbContent);
}


/**
 * Writes the .env file based on the selected database
 * @param {string} database - The database to use
 */
function writeEnvFile(database) {
    const envContent = `
PORT=3000
${database === "MongoDB" ? "MONGODB_URI=mongodb://localhost:27017/mydatabase" : ""}
${database === "MySQL" ? `
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=mydatabase
` : ""}
${database === "PostgreSQL" ? `
PGUSER=postgres
PGHOST=localhost
PGDATABASE=mydatabase
PGPASSWORD=
PGPORT=5432
` : ""}
${database === "SQLite" ? "SQLITE_PATH=./database.sqlite" : ""}
`.trim();

    fs.writeFileSync(path.resolve(".env"), envContent);
}

/**
 * Writes the config file based on the selected database and TypeScript option
 * @param {boolean} useTypeScript - Whether to use TypeScript
 * @param {string} database - The database to use
 */
function writeConfigFile(useTypeScript, database) {
    const ext = useTypeScript ? "ts" : "js";
    const configContent = `
import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    ${database === "MongoDB" ? "mongodbUri: process.env.MONGODB_URI," : ""}
    ${database === "MySQL" ? `
    mysqlHost: process.env.MYSQL_HOST,
    mysqlUser: process.env.MYSQL_USER,
    mysqlPassword: process.env.MYSQL_PASSWORD,
    mysqlDatabase: process.env.MYSQL_DATABASE,
    ` : ""}
    ${database === "PostgreSQL" ? `
    pgUser: process.env.PGUSER,
    pgHost: process.env.PGHOST,
    pgDatabase: process.env.PGDATABASE,
    pgPassword: process.env.PGPASSWORD,
    pgPort: parseInt(process.env.PGPORT || '5432'),
    ` : ""}
    ${database === "SQLite" ? "sqlitePath: process.env.SQLITE_PATH," : ""}
};
`.trim();

    fs.writeFileSync(path.resolve(`src/config.${ext}`), configContent);
}

export {
    generateFiles,
    createFolderStructure,
    generateBaseFiles,
    writeEnvFile,
    writeConfigFile,
};
