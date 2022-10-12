const DataProcessing = require("./data_processing");
const userSchema = require("./schemas/user_schema");
const chatSchema = require("./schemas/chat_schema");

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

      let users = await userSchema.where("_id").equals(userData._id);
      let user = users[0];
      if (user) return;

      await userSchema.create({
        _id: userData._id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
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

  async get() {
    const userData = this.dataProcessing.extractSenderData(this.message);
    let users = await userSchema.where("_id").equals(userData._id);
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

      let users = await userSchema.where("_id").equals(userData._id);
      let user = users[0];

      if (!user) {
        await this.add(0, userData);
        await this._updateChat(userData);
      }

      if (user.giftsCountdown.smallGift <= 0) {
        user.giftsCountdown.smallGift = 300;
      }
      if (user.giftsCountdown.smallGift <= 0) {
        user.giftsCountdown.averageGift = 1000;
      }
      if (user.giftsCountdown.smallGift <= 0) {
        user.giftsCountdown.bigGift = 5000;
      }
      user.rating.prevRating = user.rating.currentRating;
      user.rating.currentRating += rating;

      user.giftsCountdown.smallGift -= rating;
      user.giftsCountdown.averageGift -= rating;
      user.giftsCountdown.bigGift -= rating;

      await user.save();
      await this._updateChat(userData);
      console.log("data updated");
    } catch (error) {
      console.log(error);
    }
  }

  async _updateChat(user) {
    try {
      const chats = await chatSchema.where("_id").equals(this.message.chat.id);
      const chat = chats[0];

      if (chat) {
        if (chat.users.includes(user._id)) return;
        console.log(chat.users);
        chat.users.push(user._id);
        await chat.save();
      } else {
        if (this.message.chat.type === "private") return;

        const chat = await chatSchema.create({
          _id: this.message.chat.id,
        });
        chat.users.push(user._id);
        await chat.save();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUsers() {
    const chats = await chatSchema
      .where("_id")
      .equals(this.message.chat.id)
      .populate("users");

    const usersList = chats[0].users;
    const sortedArray = usersList.sort(this._sortArr);
    return sortedArray;
  }

  async printUsers(usersList) {
    let line = "Members rating:";

    if (!usersList) return;

    await usersList.forEach((user) => {
      line =
        line +
        `\n ${user.username || user.first_name || user.last_name}: ${
          user.rating.currentRating
        }`;
    });

    return line;
  }

  async sortUsers() {
    await userSchema.aggregate([
      { $group: { _id: "$username" } },
      { $limit: 50 },
      { $sort: { currentRating: -1 } },
    ]);
  }

  _sortArr(a, b) {
    if (a.rating.currentRating > b.rating.currentRating) {
      return -1;
    } else if (a.rating.currentRating < b.rating.currentRating) {
      return 1;
    } else {
      return 0;
    }
  }
  async aboba() {}

  // -------------------------------------------------------------------------

  // async updateChat(user) {
  //   const chat = await this.chats.findOne({ _id: this.message.chat.id });

  //   if (chat) {
  //     if (chat.users.includes(user._id)) return;

  //     await this.chats.updateOne(
  //       { _id: this.message.chat.id },
  //       { $push: { users: user._id } }
  //     );
  //   } else {
  //     if (this.message.chat.type === "private") return;
  //     const userId = [user._id];

  //     await this.chats.insertOne({ _id: this.message.chat.id, users: userId });
  //   }
  // }

  // async add(currentRating = 0, data = null) {
  //   let userData;
  //   if (data) {
  //     userData = data;
  //   } else {
  //     userData = this.dataProcessing.extractSenderData();
  //   }

  //   const user = await this.users.findOne({ _id: userData._id });

  //   if (user) return;

  //   userData.prevRating = 0;
  //   userData.currentRating = currentRating;
  //   await this.users.insertOne(userData);

  //   console.log("user added");
  // }

  // async update(currentRating = 0, target) {
  //   let userData;

  //   if (target === "receiver") {
  //     userData = this.dataProcessing.extractReceiverData();
  //   } else if (target === "sender") {
  //     userData = this.dataProcessing.extractSenderData();
  //   } else {
  //     return;
  //   }

  //   const user = await this.users.findOne({
  //     _id: userData._id,
  //   });

  //   if (user) {
  //     user.prevRating = user.currentRating;
  //     user.currentRating += currentRating;
  //     await this.users.updateOne({ _id: userData._id }, { $set: user });
  //     await this.updateChat(user);

  //     console.log("data updated");
  //   } else {
  //     userData.prevRating = 0;
  //     userData.currentRating = currentRating;
  //     await this.users.insertOne(userData);
  //     await this.updateChat(userData);

  //     console.log("user added but you shouldn't see it");
  //   }
  // }

  // async oldget() {
  //   const userData = this.dataProcessing.extractSenderData(this.message);
  //   const user = await this.users.findOne({ _id: userData._id });

  //   if (user) {
  //     return user;
  //   }

  //   console.log("user wasn't found");
  //   return user;
  // }
};
