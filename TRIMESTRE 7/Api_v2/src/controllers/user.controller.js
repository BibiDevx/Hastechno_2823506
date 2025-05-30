import bcryptjs from 'bcryptjs';
import userModel from '../models/user.model.js';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';


export const newUser = async (req, res) => {
  try {
    const salt = await bcryptjs.genSalt(10);
    const { user_name, user_password, status, role } = req.body;
    const passwordHash = await bcryptjs.hash(user_password, salt);

    const newUser = await userModel.create({
      user_user: user_name,
      user_password: passwordHash,
      userStatus_FK: status,
      role_FK: role
    });

    const token = jwt.sign(
      { email: newUser.user_user }, 
      process.env.JWK_SECRET, 
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      ok: true,
      status: 201,
      message: "Create User",
      id: newUser.user_id,
      token: token  
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Something went wrong creating the user",
      status: 500
    });
  }
};

export const showUser = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.status(200).json({
      ok: true,
      status: 200,
      message: 'Show Users :)',
      body: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'something was wrong in the consultation',
      status: 500,
    });
  }
};

export const showUserId = async (req, res) => {
  try {
    const idUser = req.params.id; 
    const user = await userModel.findOne({
      where: {
        user_id: idUser,
      },
    });
    res.status(200).json({
      ok: true,
      status: 200,
      message: 'Show Users Id :)',
      body: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'something was wrong in the consultation',
      status: 500,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    await userModel.sync();
    const idUser = req.params.id;
    const dataUser = req.body;
    const passwordHash = dataUser.user_password
      ? await bcryptjs.hash(dataUser.user_password, 10)
      : undefined;
    const updateData = {
      user_user: dataUser.user_name,
      userStatus_FK: dataUser.status,
      role_FK: dataUser.role,
    };
    if (passwordHash) updateData.user_password = passwordHash;

    const updateUser = await userModel.update(updateData, {
      where: {
        user_id: idUser,
      }
    });

    res.status(200).json({
      ok: true,
      status: 200,
      message: 'Update User :)',
      body: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong in the request',
      status: 500,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userModel.sync();
    const idUser = req.params.id;
    const deleteUser = await userModel.destroy({
      where: {
        user_id: idUser,
      }
    });

    res.status(200).json({
      ok: true,
      status: 200,
      message: 'Delete User :)',
      body: deleteUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong in the request',
      status: 500,
    });
  }
};

export const createUserFK = async (req, res) => {
  try {
    await userModel.sync();
    const createdUser = await userModel.create({
      user_user: faker.internet.email(),
      user_password: await bcryptjs.hash(faker.internet.password(), 10),
      userStatus_FK: 1,
      role_FK: 1,
    });

    res.status(201).json({
      ok: true,
      status: 201,
      message: 'Create User',
      id: createdUser.user_id
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong in the request',
      status: 500,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    await userModel.sync();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email and password'
      });
    }

    const user = await userModel.findOne({
      where: {
        user_user: email
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcryptjs.compare(password, user.user_password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: user.user_user },
      process.env.JWK_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Login API :)',
      id: user.user_id,
      token: token
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong in the consultation',
      status: 500
    });
  }
};
