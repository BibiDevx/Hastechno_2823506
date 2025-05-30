import userStatusModel from '../models/userStatus.model.js';
import userModel from '../models/user.model.js';
import { faker } from '@faker-js/faker';


export const createUserStatus = async (req, res) => {
  try {
    const { userStatus_name, userStatus_descriptions } = req.body;
    const newStatus = await userStatusModel.create({
      userStatus_name,
      userStatus_descriptions
    });
    return res.status(201).json({
      ok: true,
      status: 201,
      message: 'Create User Status :)',
      id: newStatus.userStatus_id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || 'Something went wrong in the consultation',
      status: 500
    });
  }
};

// Get all UserStatus entries
export const showUserStatus = async (req, res) => {
  try {
    const statuses = await userStatusModel.findAll();
    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Show User Statuses :)',
      body: statuses
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || 'Something went wrong in the request',
      status: 500
    });
  }
};

// Get a UserStatus by ID
export const showIdUserStatus = async (req, res) => {
  try {
    const idStatus = req.params.id;
    const status = await userStatusModel.findOne({
      where: { userStatus_id: idStatus }
    });
    if (!status) {
      return res.status(404).json({ ok: false, status: 404, message: 'UserStatus not found' });
    }
    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Show User Status by ID :)',
      body: status
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || 'Something went wrong in the consultation',
      status: 500
    });
  }
};

// Update a UserStatus by ID
export const updateUserStatus = async (req, res) => {
  try {
    const idStatus = req.params.id;
    const { userStatus_name, userStatus_descriptions } = req.body;
    const [updatedCount] = await userStatusModel.update(
      { userStatus_name, userStatus_descriptions },
      { where: { userStatus_id: idStatus } }
    );
    if (updatedCount === 0) {
      return res.status(404).json({ ok: false, status: 404, message: 'UserStatus not found' });
    }
    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Update User Status :)'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || 'Something went wrong in the request',
      status: 500
    });
  }
};

// Delete a UserStatus by ID
export const deleteUserStatus = async (req, res) => {
  try {
    const idStatus = req.params.id;
    const deletedCount = await userStatusModel.destroy({
      where: { userStatus_id: idStatus }
    });
    if (deletedCount === 0) {
      return res.status(404).json({ ok: false, status: 404, message: 'UserStatus not found' });
    }
    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Delete User Status :)'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || 'Something went wrong in the request',
      status: 500
    });
  }
};

// Create a fake User (for FK relations)
export const createUserFK = async (req, res) => {
  try {
    const fakeUser = await userModel.create({
      user_user: faker.internet.email(),
      user_password: faker.internet.password(),
      userStatus_FK: 1,
      role_FK: 1
    });
    return res.status(201).json({
      ok: true,
      status: 201,
      message: 'Create User via FK :)',
      id: fakeUser.user_id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || 'Something went wrong in the request',
      status: 500
    });
  }
};
