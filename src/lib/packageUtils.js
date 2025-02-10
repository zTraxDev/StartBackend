import path from "path";
import { writeFile } from "./fileUtils.js";

export function writePackageJson(projectName, useTypeScript) {
    const packageJsonPath = path.resolve("package.json"); // Usa path.resolve

    const packageJson = {
        name: projectName.toLowerCase().replace(/\s+/g, "-"),
        version: "1.0.0",
        main: "src/index.js",
        type: "module",
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

    writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}