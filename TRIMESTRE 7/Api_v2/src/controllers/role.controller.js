import roleModel from '../models/role.model.js';

export const createRole= async (req,res)=>{
    try{
        await roleModel.sync();
        const dataRole=req.body;
        const createRole= await roleModel.create({
            role_name:dataRole.role_name,
            role_descriptions:dataRole.role_descriptions,
        });
        res.status(201).json({
            ok:true,
            status:201,
            message:'Create Role :)',
            id:createRole.role_id,
        });
    }catch(error){
        return res.status(500).json({
            message:'Something went wrong in the request',
            status:500,
        });
    }    
};

export const showRole= async (req,res)=>{
    try{
        await roleModel.sync();
        const showRoles= await roleModel.findAll();
        res.status(200).json({
            ok:true,
            status:200,
            message:'Show Role :)',
            body:showRoles,
        });
    }
    catch(error){
        return res.status(500).json({
            message:'Something went wrong in the request',
            status:500,
        });
    }
};

export const showIdRole= async (req,res)=>{
    try{
        await roleModel.sync();
        const idRole=req.params.id;
        const showRoleId= await roleModel.findOne({
    
            where:{
                role_id:idRole,

            }
        });
        res.status(200).json({
            ok:true,
            status:200,
            message:'Show Id Role :)',
            body:showRoleId,

        })
    }
    catch(error){
        return res.status(500).json({
            message:'Something went wrong in the request',
            status:500,
        });

    }
    };

    export const updateRole= async (req,res)=>{
    try{
        await roleModel.sync();
        const dataRole=req.body;
        const idRole= req.params.id; 
        const updateRole= await roleModel.update({
            role_name:dataRole.role_name,
            role_descriptions:dataRole.role_descriptions,


        },{

            where:{
                role_id:idRole,

            }

        });

        res.status(200).json({
            ok:true,
            status:200,
            message:'Update Role :)',
            body:updateRole,

        });
    } catch(error){
        return res.status(500).json({
            message:'Something went wrong in the request',
            status:500,      });

    }
    };

    export const deleteRole= async (req,res)=>{
    try{
        await roleModel.sync();
        const idRole= req.params.id; 
        const deleteRole= await roleModel.destroy({

            where:{
                role_id:idRole,

            }
         
        });

        res.status(200).json({
            ok:true,
            status:200,
            message:'Delete Role :)',
            body:deleteRole,

        });
    } catch(error){
        return res.status(500).json({
            message:'Something went wrong in the request',
            status:500,      
        });

    }
    };

    
