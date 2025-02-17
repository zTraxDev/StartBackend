"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Example extends sequelize_1.Model {
    id;
    name;
    age;
}
exports.default = Example;
