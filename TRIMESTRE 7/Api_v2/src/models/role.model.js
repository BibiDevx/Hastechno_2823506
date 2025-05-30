import  sequelize  from "../config/connect.db.js";
import { Model, DataTypes } from "sequelize";

class Role extends Model {}

Role.init({
    role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    role_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    role_descriptions:{
        type: DataTypes.STRING,
        allowNull: true,
    }
},{ sequelize, modelName: "Role"});

export default Role;