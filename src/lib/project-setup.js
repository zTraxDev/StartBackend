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

export const sequelize = new Sequelize(config.sequelize.databaseUrl);

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
    host: config.${database === "MySQL" ? 'mysql.host' : database === "PostgreSQL" ? 'postgres.host' : 'sqlitePath'},
    port: config.${database === "MySQL" ? 'mysql.port' : database === "PostgreSQL" ? 'postgres.port' : 'sqlitePort'},
    username: config.${database === "MySQL" ? 'mysql.user' : 'postgres.user'},
    password: config.${database === "MySQL" ? 'mysql.password' : 'postgres.password'},
    database: config.${database === "MySQL" ? 'mysql.database' : 'postgres.database'},
    synchronize: config.${orm === "TypeORM" ? 'typeorm.synchronize' : 'false'},
    logging: config.${orm === "TypeORM" ? 'typeorm.logging' : 'false'},
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
        const dbConnections = {
            MongoDB: `
import mongoose from 'mongoose';
import { config } from './config.${ext}';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodbUri || '', {});
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
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
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
    user: config.postgres.user,
    host: config.postgres.host,
    database: config.postgres.database,
    password: config.postgres.password,
    port: config.postgres.port,
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
        };

        dbContent = dbConnections[database];
    }

    fs.writeFileSync(path.resolve("src/config", `db.${ext}`), dbContent);
}



/**
 * Writes the .env file based on the selected database
 * @param {string} database - The database to use
 */
function writeEnvFile(database, orm) {
    const envContent = `
PORT=3000
${database === "MongoDB" ? "MONGODB_URI=mongodb://localhost:27017/mydatabase" : ""}
${database === "MySQL" ? `MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=mydatabase` : ""}
${database === "PostgreSQL" ? `PGUSER=postgres
PGHOST=localhost
PGDATABASE=mydatabase
PGPASSWORD=
PGPORT=5432` : ""}
${database === "SQLite" ? "SQLITE_PATH=./database.sqlite" : ""}

# ORM Configurations
${orm === "Sequelize" ? `
SEQUELIZE_DATABASE_URL=${database === "MySQL" ? "mysql://root:@localhost/mydatabase" : ""}
SEQUELIZE_LOGGING=true
` : ""}
${orm === "TypeORM" ? `
TYPEORM_CONNECTION=${database === "MySQL" ? "mysql" : database.toLowerCase()}
TYPEORM_HOST=localhost
TYPEORM_PORT=${database === "PostgreSQL" ? 5432 : 3306}
TYPEORM_USERNAME=root
TYPEORM_PASSWORD=
TYPEORM_DATABASE=mydatabase
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=true
` : ""}
`.trim();

    fs.writeFileSync(path.resolve(".env"), envContent);
}
/**
 * Writes the config file based on the selected database and TypeScript option
 * @param {boolean} useTypeScript - Whether to use TypeScript
 * @param {string} database - The database to use
 */
function writeConfigFile(useTypeScript, database, orm) {
    const ext = useTypeScript ? "ts" : "js";

    // Crear la base de la configuración
    const configContent = `
import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    ${database === "MongoDB" ? "mongodbUri: process.env.MONGODB_URI," : ""}
    ${database === "MySQL" ? `
    mysql: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    },` : ""}
    ${database === "PostgreSQL" ? `
    postgres: {
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: parseInt(process.env.PGPORT || '5432')
    },` : ""}
    ${database === "SQLite" ? "sqlitePath: process.env.SQLITE_PATH," : ""}

    // ORM Configurations
    ${orm === "Sequelize" ? `
    sequelize: {
        databaseUrl: process.env.SEQUELIZE_DATABASE_URL as string,
        logging: process.env.SEQUELIZE_LOGGING === 'true' // Asegúrate de que esté 'true' o 'false' en el .env
    },` : ""}
    ${orm === "TypeORM" ? `
    typeorm: {
        connection: process.env.TYPEORM_CONNECTION,
        host: process.env.TYPEORM_HOST,
        port: parseInt(process.env.TYPEORM_PORT || '3306'),
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,
        synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
        logging: process.env.TYPEORM_LOGGING === 'true'
    },` : ""}
};
`.trim();

    // Guardar el archivo de configuración
    fs.writeFileSync(path.resolve(`src/config/config.${ext}`), configContent);
}


export {
    generateFiles,
    createFolderStructure,
    generateBaseFiles,
    writeEnvFile,
    writeConfigFile,
};
