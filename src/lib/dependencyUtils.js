import { execSync } from "child_process";

/**
 * Instala las dependencias del proyecto
 * @param {boolean} useTypeScript - Si se debe usar TypeScript
 * @param {string} database - La base de datos a utilizar
 * @param {string} framework - El framework a utilizar
 * @param {boolean} installEcosystem - Si se debe instalar el ecosistema
 */
export function installDependencies(useTypeScript, database, framework, installEcosystem) {
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
        dependencies.push("typescript", "@types/node", "ts-node");

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

    console.log("📦 Instalando dependencias...");
    try {
        execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
        console.log("✅ Dependencias instaladas correctamente.");
    } catch (error) {
        console.error("❌ Error durante la instalación de dependencias:", error.message);
    }

    if (useTypeScript) {
        console.log("🛠️ Configurando TypeScript...");
        try {
            execSync("npx tsc --init", { stdio: "inherit" });
            console.log("✅ TypeScript configurado correctamente.");
        } catch (error) {
            console.error("❌ Error durante la configuración de TypeScript:", error.message);
        }
    }
}
