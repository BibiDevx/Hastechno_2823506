import sequelize from "../config/connect.db.js";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import UserStatus from "../models/userStatus.model.js";

export const modelsApp = function initModels(select) {
    if(select) {
        UserStatus.hasMany(User, { foreignKey:{name:
            "userStatus_FK", field:"userStatus_FK", allowNull:true}});
            
        User.belongsTo(UserStatus, { foreignKey:{name:
            "userStatus_FK", field:"userStatus_FK", allowNull:true}, constrains:true,
        });

        Role.hasMany(User, { foreignKey:{name:
            "role_FK", field:"role_FK", allowNull:true},
        });

        User.belongsTo(Role, { as: 'Current', foreignKey:{name:
            "role_FK", field:"role_FK", allowNull:true}, constrains:true,
        });

        sequelize.sync();
        
    }
}
