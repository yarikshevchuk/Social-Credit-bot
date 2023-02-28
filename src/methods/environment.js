const EnvModel = require("../models/environmentModel");
const Chat = require("./chat");
const User = require("./user");

class Environment {
  static async findById(envId) {
    return await EnvModel.findOne({ _id: envId });
  }

  static async create(user) {
    try {
      if (!user) return;

      const env = await Environment.findById(user.env);
      if (env) return env;
      const allUsers = [];

      for (let i = 0; i < user.chats.length; i++) {
        const chat = await Chat.findById(user.chats[i]);
        if (!chat) continue;
        if (!chat.users) continue;

        allUsers.push(...chat.users);
      }

      const uniqueUsers = new Set(allUsers);
      uniqueUsers.delete(user._id);

      const users = [...uniqueUsers];

      const newEnv = await EnvModel.create({
        user: user._id,
        users: users,
      });

      user.env = newEnv;
      user.save();

      return newEnv;
    } catch (error) {
      console.log(error);
    }
  }

  static async update(user) {
    try {
      if (!user) return;

      const env = await Environment.findById(user.env);
      if (!env) return;

      const allUsers = [];

      for (let i = 0; i < user.chats.length; i++) {
        const chat = await Chat.findById(user.chats[i]);
        if (!chat) continue;
        if (!chat.users) continue;

        allUsers.push(...chat.users);
      }

      const uniqueUsers = new Set(allUsers);
      uniqueUsers.delete(user._id);

      const users = [...uniqueUsers];

      env.users = users;
      await env.save();

      return env;
    } catch (error) {
      console.log(error);
    }
  }

  static async getAverageRating(user) {
    try {
      if (!user) return;
      if (!user.env) return;

      const env = await Environment.findById(user.env);

      if (!env) return;
      let overallRating = user.rating.currentRating;

      for (let i = 0; i < env.users.length; i++) {
        const envUser = await User.findInTreeById(env.users[i]);

        overallRating += envUser.rating.currentRating;
      }
      // console.log(`Environment ${user.env} rating: ${overallRating}`);
      const averageRating = (overallRating / (env.users.length + 1)).toFixed(8);

      return averageRating;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Environment;
