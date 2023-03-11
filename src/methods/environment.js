const EnvModel = require("../models/environmentModel");
const Chat = require("./chat");
const usersTree = require("../dataProcessing/usersTree.js");

class Environment {
  static async findById(envId) {
    return await EnvModel.findOne({ _id: envId });
  }

  static async findUserInTreeById(userId) {
    try {
      const tree = await usersTree.get();
      const root = tree.getRoot();

      return await tree.find(parseInt(userId), root);
    } catch (error) {
      console.log(error);
    }
  }

  static async create(user) {
    try {
      if (!user) return;

      const env = await Environment.findById(user.env);
      if (env) return env;

      // if user doesn't have any chats, we create empty environment for him
      if (!user.chats || user.chats.length === 0) {
        const newEnv = await EnvModel.create({
          user: user._id,
          users: [],
        });
        user.chats = []; // here we create empty chats array too
        user.env = newEnv;
        await user.save();

        return newEnv;
      }

      // going through every chat and collecting users ids
      const allUsers = [];
      for (let i = 0; i < user.chats.length; i++) {
        const chat = await Chat.findById(user.chats[i]);
        if (!chat) continue;
        if (!chat.users) continue;

        allUsers.push(...chat.users);
      }

      // getting only unique users without our target
      const uniqueUsers = new Set(allUsers);
      uniqueUsers.delete(user._id);

      // array out of map object
      const users = [...uniqueUsers];

      // creating new env document
      const newEnv = await EnvModel.create({
        user: user._id,
        users: users,
      });

      // saving everything
      user.env = newEnv;
      await user.save();

      return newEnv;
    } catch (error) {
      console.log(error);
    }
  }

  static async update(user) {
    try {
      if (!user) return;

      // if env doesn't exist, we return
      const env = await Environment.findById(user.env);
      if (!env) return;

      // if user doesn't have any chats, we clear env and return it
      if (!user.chats || user.chats.length === 0) {
        env.users = [];
        await env.save();
        return env;
      }

      // going through every chat and collecting users ids
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
      let length = env.users.length;
      // if there are no connections, we just return user's rating
      if (env.users.length === 0) return overallRating;

      for (let i = 0; i < env.users.length; i++) {
        const envUser = await Environment.findUserInTreeById(env.users[i]);
        if (!envUser) {
          length -= 1;
          continue;
        }

        overallRating += envUser.rating.currentRating;
      }
      const averageRating = (overallRating / (length + 1)).toFixed(8);

      return averageRating;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Environment;
