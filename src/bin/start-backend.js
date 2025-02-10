#!/usr/bin/env node

import { generateFiles } from "../lib/file-generator.js";
import { askQuestions } from "../lib/prompt.js";
import { validateProjectName, GREEN, NC } from "../lib/utils.js";
import path from "path";

(async () => {
  console.log(`${GREEN}🚀 Bienvenido a Start Backend!${NC}`);

  try {
    // Preguntas al usuario
    const answers = await askQuestions();

    // Validar el nombre del proyecto
    if (!validateProjectName(answers.projectName)) {
      console.log(`${GREEN}El nombre del proyecto no puede estar vacío o contener caracteres especiales.${NC}`);
      process.exit(1);
    }

    // Crear el proyecto con las opciones seleccionadas
    generateFiles(answers.projectName, {
      useTypeScript: answers.typescript,
      useMongoDB: answers.database === "MongoDB",
      database: answers.database,
      useMVC: answers.useMVC,
      framework: answers.framework,
      installEcosystem: answers.installEcosystem,
      orm: answers.orm ?? "Ninguno" // Se agrega el soporte para ORM
    });

    console.log(`${GREEN}✅ Proyecto creado exitosamente!${NC}`);
  } catch (error) {
    console.error(`${GREEN}❌ Error:${NC}`, error.message || error);
    process.exit(1);
  }
})();