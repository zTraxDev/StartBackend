import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface ExampleAttributes {
    id: number;
    name: string;
    age: number;
}

interface ExampleCreationAttributes extends Optional<ExampleAttributes, 'id'> {}

class Example extends Model<ExampleAttributes, ExampleCreationAttributes> 
    implements ExampleAttributes {
    public id!: number;
    public name!: string;
    public age!: number;
}

Example.init({
    name: DataTypes.STRING,
    age: DataTypes.INTEGER,
}, {
    sequelize,
    modelName: 'Example'
});

export default Example;