const DataProcessing = require("./data_processing");
const UserModel = require("./models/userModel");
const ChatModel = require("./models/chatModel");
const RoleModel = require("./models/roleModel");
const Language = require("./languages/language");

module.exports = class User {
  constructor(message) {
    this.message = message;
    this.dataProcessing = new DataProcessing(message);
  }

  async add(currentRating, data = null) {
    try {
      let userData;
      if (data) {
        userData = data;
      } else {
        userData = this.dataProcessing.extractSenderData();
      }

      let users = await UserModel.where("_id").equals(userData._id);
      let user = users[0];
      if (user) return;

      const userRoles = await RoleModel.where("value").equals("PARTYWORKER");
      const userRole = userRoles[0];

      await UserModel.create({
        _id: userData._id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        roles: [userRole.value],
        rating: {
          currentRating: currentRating,
          prevRating: 0,
        },
        giftsCountdown: {
          bowlOfRice: 300,
          catWife: 1000,
          respectFromXi: 5000,
        },
      });
      console.log("user added");
    } catch (error) {
      console.log(error);
    }
  }

  async get(target) {
    let userData;

    if (target === "receiver") {
      userData = this.dataProcessing.extractReceiverData();
    } else if (target === "sender") {
      userData = this.dataProcessing.extractSenderData();
    } else {
      return;
    }

    let users = await UserModel.where("_id").equals(userData._id);
    let user = users[0];

    if (!user) {
      console.log("user wasn't found");
    }

    console.log(user);

    return user;
  }

  async update(rating, target) {
    try {
      let userData;

      if (target === "receiver") {
        userData = this.dataProcessing.extractReceiverData();
      } else if (target === "sender") {
        userData = this.dataProcessing.extractSenderData();
      } else {
        return;
      }

      let users = await UserModel.where("_id").equals(userData._id);
      let user = users[0];

      if (!user) {
        await this.add(rating, userData);
        await this._updateChat(userData);
      }

      user.rating.prevRating = user.rating.currentRating;
      user.rating.currentRating += rating;

      const userRoles = await RoleModel.where("value").equals("PARTYWORKER");
      user.roles[0] = userRoles[0].value;

      // якщо рейтинг користувача нижче нуля, тоді не можна змінювати відлік подарунку
      // якщо рейтинг вище нуля, та його зменшують, не треба зменшувати відлік подарунку
      if (
        user.rating.currentRating < 0 ||
        (user.rating.currentRating > 0 && rating < 0)
      ) {
        await user.save();
        await this._updateChat(userData);
        return;
      }

      user.giftsCountdown.smallGift -= rating;
      user.giftsCountdown.averageGift -= rating;
      user.giftsCountdown.bigGift -= rating;

      // updating role

      // const userRoles = await RoleModel.where("value").equals("PARTYWORKER");
      // const userRole = userRoles[0];
      // const userRole = await Role.findOne({ value: "USER" });
      // console.log(userRole);
      // user.roles[0] = userRole.value;

      await user.save();
      await this._updateChat(userData);
      console.log("data updated");
    } catch (error) {
      console.log(error);
    }
  }

  async _updateChat(user) {
    try {
      const chats = await ChatModel.where("_id").equals(this.message.chat.id);
      const chat = chats[0];

      if (chat) {
        if (chat.users.includes(user._id)) return;
        chat.users.push(user._id);
        await chat.save();
      } else {
        if (this.message.chat.type === "private") return;

        const chat = await ChatModel.create({
          _id: this.message.chat.id,
        });
        chat.users.push(user._id);
        await chat.save();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async changeLanguage(data) {
    try {
      const chats = await ChatModel.where("_id").equals(this.message.chat.id);
      const chat = chats[0];

      if (chat) {
        chat.language = data;
        await chat.save();
      } else {
        if (this.message.chat.type === "private") return;

        const chat = await ChatModel.create({
          _id: this.message.chat.id,
        });
        chat.language = data;
        await chat.save();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUsers() {
    try {
      const chats = await ChatModel.where("_id")
        .equals(this.message.chat.id)
        .populate("users");

      const usersList = chats[0].users;
      const sortedArray = usersList.sort(this._sortArr);
      return sortedArray;
    } catch (error) {
      console.log(error);
    }
  }

  async printUsers(usersList) {
    try {
      const lang = new Language(this.message);
      let language = await lang.select();

      let response = `${language.printUsers.response}`;

      if (!usersList) return;

      await usersList.forEach((user, index) => {
        response =
          response +
          `\n${index + 1}) ${
            user.username || user.first_name || user.last_name
          }: ${user.rating.currentRating}`;
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  // async sortUsers() {
  //   await UserSchema.aggregate([
  //     { $group: { _id: "$username" } },
  //     { $limit: 50 },
  //     { $sort: { currentRating: -1 } },
  //   ]);
  // }

  _sortArr(a, b) {
    if (a.rating.currentRating > b.rating.currentRating) {
      return -1;
    } else if (a.rating.currentRating < b.rating.currentRating) {
      return 1;
    } else {
      return 0;
    }
  }

  async aboba(ctx) {
    try {
      await UserModel.updateMany(
        {},
        { $set: { roles: ["PARTYWORKER"] } },
        { upsert: false }
      );

      // awaitUserModel.save();

      console.log("success");
    } catch (error) {
      console.log(error);
    }
  }
};
