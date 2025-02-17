import { execSync } from "child_process";
import fs from "fs";

/**
 * Instala las dependencias del proyecto
 * @param {boolean} useTypeScript - Si se debe usar TypeScript
 * @param {string} database - La base de datos a utilizar
 * @param {string} framework - El framework a utilizar
 * @param {boolean} installEcosystem - Si se debe instalar el ecosistema
 * @param {string} orm - El ORM a utilizar (opcional)
 */
export function installDependencies(useTypeScript, database, framework, installEcosystem, orm = "Ninguno") {
    const dependencies = ["dotenv", "nodemon"];

    // Dependencias del framework
    if (framework === "Express") {
        dependencies.push("express");

        // Si el usuario eligió instalar el ecosistema de Express
        if (installEcosystem) {
            dependencies.push(
                "express-rate-limit", // Rate limiting
                "express-session", // Manejo de sesiones
                "jsonwebtoken", // JWT
                "express-validator" // Validación de datos
            );
        }
    } else if (framework === "Fastify") {
        dependencies.push("fastify", "fastify-cli");
    } else if (framework === 'Hono') {
        dependencies.push('hono', '@hono/node-server');
    }

    // Dependencias de la base de datos
    const dbDependencies = {
        "MongoDB": "mongoose",
        "MySQL": "mysql2",
        "PostgreSQL": "pg",
        "SQLite": "sqlite3"
    };
    dependencies.push(dbDependencies[database]);

    // Dependencias de TypeScript
    if (useTypeScript) {
        dependencies.push("typescript", "@types/node", "ts-node", "tsc-watch", 'zod');

        if (framework === "Express") {
            dependencies.push("@types/express");
            if (installEcosystem) {
                dependencies.push(
                    "@types/express-rate-limit",
                    "@types/express-session",
                    "@types/jsonwebtoken"
                );
            }
        } else if (framework === "Fastify") {
            dependencies.push("@types/fastify");
        }
    }

    // Dependencias del ORM
    if (orm !== "Ninguno") {
        if (orm === "Sequelize") {
            dependencies.push("sequelize", "sequelize-cli");
            if (database === "PostgreSQL") {
                dependencies.push("pg-hstore");
            } else if (database === "MySQL") {
                dependencies.push("mysql2");
            } else if (database === "SQLite") {
                dependencies.push("sqlite3");
            }
        } else if (orm === "TypeORM") {
            dependencies.push("typeorm", "reflect-metadata");
        }
    }

    console.log("📦 Instalando dependencias...");
    try {
        execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
        console.log("✅ Dependencias instaladas correctamente.");
    } catch (error) {
        console.error("❌ Error durante la instalación de dependencias:", error.message);
    }

    // Configuración de TypeScript
    if (useTypeScript) {
        const tsconfig = {
            "compilerOptions": {
                "target": "ESNext",
                "module": "CommonJS",
                "moduleResolution": "Node",
                "outDir": "./dist",
                "rootDir": "./src",
                "strict": true,
                "esModuleInterop": true,
                "skipLibCheck": true,
                "forceConsistentCasingInFileNames": true,
                "resolveJsonModule": true,
                "allowSyntheticDefaultImports": true,
                "noImplicitAny": true,
                "strictNullChecks": true,
                "strictFunctionTypes": true,
                "strictPropertyInitialization": true,
                "noUnusedLocals": true,
                "noUnusedParameters": true,
                "noFallthroughCasesInSwitch": true,
                ...(orm === 'TypeORM' && {
                    "experimentalDecorators": true,
                    "emitDecoratorMetadata": true
                })
            },
            "include": ["src"],
            "exclude": ["node_modules", "dist"]
        };
        fs.writeFileSync("tsconfig.json", JSON.stringify(tsconfig, null, 2));
        console.log("✅ Archivo tsconfig.json generado correctamente.");
    }

}