"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("./config");
exports.sequelize = new sequelize_1.Sequelize(config_1.config.sequelize.databaseUrl);
exports.sequelize.authenticate()
    .then(() => console.log('Sequelize conectado'))
    .catch(err => console.error('Error conectando a Sequelize:', err));
