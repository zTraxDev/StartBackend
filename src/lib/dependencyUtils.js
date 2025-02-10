import { execSync } from "child_process";
import path from "path";

// Instalar dependencias
export function installDependencies(useTypeScript, database, framework, installEcosystem) {
    const dependencies = ["dotenv"];

    // Dependencias del framework
    if (framework === "Express") {
        dependencies.push("express");
        dependencies.push("nodemon");

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
        dependencies.push(
            "fastify",
            "fastify-cli",
            "nodemon"
        );
    }

    // Dependencias de la base de datos
    switch (database) {
        case "MongoDB":
            dependencies.push("mongoose");
            break;
        case "MySQL":
            dependencies.push("mysql2");
            break;
        case "PostgreSQL":
            dependencies.push("pg");
            break;
        case "SQLite":
            dependencies.push("sqlite3");
            break;
    }

    // Dependencias de TypeScript
    if (useTypeScript) {
        dependencies.push("typescript", "@types/node");
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
        dependencies.push("ts-node", "nodemon");
    }

    console.log("📦 Instalando dependencias...");
    execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });

    if (useTypeScript) {
        console.log("🛠️ Configurando TypeScript...");
        execSync("npx tsc --init", { stdio: "inherit" });
    }
}