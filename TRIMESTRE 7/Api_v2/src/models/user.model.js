import sequelize from "../config/connect.db.js";
import { Model, DataTypes } from "sequelize";

class User extends Model {}

User.init({
    user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    user_user: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    user_password:{
        type: DataTypes.STRING,
        allowNull: false,
    },

    userStatus_FK: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
    },
    role_FK: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},{ sequelize, modelName: "User",
    tableName: "User",
});

export default User;