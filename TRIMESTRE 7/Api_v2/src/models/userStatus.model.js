import sequelize from "../config/connect.db.js";
import { Model, DataTypes } from "sequelize";

class UserStatus extends Model {}

UserStatus.init({
  userStatus_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userStatus_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userStatus_descriptions: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: "UserStatus",
  tableName: "user_status",   
  freezeTableName: true,
  timestamps: true           
});

export default UserStatus;
