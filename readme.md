# 🌟 Generador de Proyectos Backend 🌟

![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![License](https://img.shields.io/github/license/tu-repo/start-my-backend?style=for-the-badge)

Generador de proyectos backend con soporte para **Express** y su ecosistema. Actualmente no cuenta con soporte para TypeScript ni otros frameworks por el momento.

## ✨ Características

- 💼 **Generador de Proyectos Backend**: Configuración inicial rápida y sencilla para tus proyectos backend.
- ⚡ **Soporte para Express**: Aprovecha la potencia y flexibilidad de Express para construir aplicaciones backend robustas.
- 🚀 **Estructura Modular**: Configuración con estructura modular para mejorar la organización del código.
- 📄 **Soporte para MVC**: Opción para generar archivos siguiendo el patrón Modelo-Vista-Controlador.
- 🛠️ **Opcional: Integración con Base de Datos**: Soporte para MongoDB, MySQL, PostgreSQL y SQLite.
- 🚫 **Sin soporte para TypeScript**: Por ahora, solo admite proyectos en JavaScript.

## 📦 Instalación

Para instalar el generador, ejecuta el siguiente comando:

```bash
npm install -g start-my-backend
```

## 🚀 Uso

Para generar un nuevo proyecto backend, simplemente ejecuta:

```bash
start-backend nombre-del-proyecto
```

### Opciones disponibles

Puedes personalizar la configuración de tu proyecto con los siguientes parámetros:

```bash
start-backend nombre-del-proyecto --database MongoDB --mvc true
```

| Opción              | Descripción |
|---------------------|-------------|
| `--database`       | Base de datos a usar (`MongoDB`, `MySQL`, `PostgreSQL`, `SQLite`). |
| `--mvc`            | Si se debe usar estructura MVC (`true` o `false`). |

## 📂 Estructura del Proyecto

Una vez generado el proyecto, la estructura tendrá la siguiente organización:

```
nombre-del-proyecto/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/ (En caso de usar MongoDB)
│   ├── routes/
│   ├── db.js
│   ├── index.js
├── .env
├── package.json
└── README.md
```

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**. ¡Siéntete libre de usarlo y contribuir! 🛠️

## 📬 Contacto

Si tienes dudas, problemas o sugerencias, abre un issue en el repositorio o contáctame en **[zTraxDev](https://github.com/zTraxDev)** 🚀.

