import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateFiles(projectDir, options = { useTypeScript: false, useMVC: false, database: "MongoDB", framework: "Express" }) {
    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });
    process.chdir(projectDir);

    createFolderStructure(options.useMVC);
    generateBaseFiles(options.framework, options.useMVC, options.useTypeScript);
    setupDatabase(options.database, options.useTypeScript);
    writeEnvFile(options.database);
    writeConfigFile(options.useTypeScript, options.database);
    configureNpmScripts(options.useTypeScript);
    installDependencies(options.useTypeScript, options.database, options.framework);
}

function installDependencies(useTypeScript, database, framework) {
    const dependencies = [framework.toLowerCase(), "dotenv"];
    const dbDependencies = { MongoDB: "mongoose", MySQL: "mysql2", PostgreSQL: "pg", SQLite: "sqlite3" };
    if (dbDependencies[database]) dependencies.push(dbDependencies[database]);
    if (useTypeScript) dependencies.push("typescript", "@types/node", "ts-node", "nodemon");

    // Agregar tipos específicos del framework
    if (useTypeScript) {
        if (framework === "Express") {
            dependencies.push("@types/express");
        } else if (framework === "Fastify") {
            dependencies.push("@types/fastify");
        }
    }

    console.log("📦 Instalando dependencias...");
    execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });

    if (useTypeScript) {
        console.log("🛠️ Configurando TypeScript...");
        execSync("npx tsc --init", { stdio: "inherit" });
    }
}

function createFolderStructure(useMVC) {
    const folders = ["src", ...(useMVC ? ["src/controllers", "src/models", "src/routes"] : [])];
    folders.forEach(folder => fs.mkdirSync(path.resolve(folder), { recursive: true }));
}

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

function setupDatabase(database, typescript) {
    const ext = typescript ? "ts" : "js";
    const dbContent = {
        MongoDB: `
import mongoose from 'mongoose';
import { config } from './config.${ext}';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodbUri || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
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
    };

    fs.writeFileSync(path.resolve("src/config", `db.${ext}`), dbContent[database]);
}

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

    fs.writeFileSync(path.resolve("src/config.${ext}"), configContent);
}

function configureNpmScripts(useTypeScript) {
    const packageJson = {
        name: "my-backend",
        version: "1.0.0",
        main: `src/index.${useTypeScript ? "ts" : "js"}`,
        scripts: {
            start: useTypeScript ? "node dist/index.js" : "node src/index.js",
            dev: useTypeScript
                ? 'nodemon --watch "src/**/*.ts" --exec "ts-node" src/index.ts'
                : "nodemon src/index.js",
            build: useTypeScript ? "tsc" : undefined,
        },
        dependencies: {},
        devDependencies: {},
    };

    fs.writeFileSync(path.resolve("package.json"), JSON.stringify(packageJson, null, 2));
}