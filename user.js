const DataProcessing = require("./data-processing");

module.exports = class User {
  constructor(chats, users, message) {
    this.chats = chats;
    this.users = users;
    this.message = message;
    this.dataProcessing = new DataProcessing(message);
  }

  async add(rating = 0) {
    const userData = this.dataProcessing.extractSenderData(this.message);
    const user = await this.users.findOne({ _id: userData._id });

    if (user) return;

    userData.rating = rating;
    await this.users.insertOne(userData);

    console.log("user added");
  }

  async update(rating = 0) {
    const userData = this.dataProcessing.extractReplyToData(this.message);
    const user = await this.users.findOne({
      _id: userData._id,
    });

    if (user) {
      user.rating += rating;
      await this.users.updateOne({ _id: userData._id }, { $set: user });
      await this.updateChat(user);

      console.log("data updated");
    } else {
      userData.rating = rating;
      await this.users.insertOne(userData);
      await this.updateChat(userData);

      console.log("user added");
    }
  }

  async get() {
    const userData = this.dataProcessing.extractSenderData(this.message);
    const user = await this.users.findOne({ _id: userData._id });

    if (user) {
      return user;
    }

    console.log("user wasn't found");
    return "";
  }

  async updateChat(user) {
    const chat = await this.chats.findOne({ _id: this.message.chat.id });

    if (chat) {
      if (chat.users.includes(user._id)) return;

      await this.chats.updateOne(
        { _id: this.message.chat.id },
        { $push: { users: this.user._id } }
      );
    } else {
      const userId = [this.user._id];

      await this.chats.insertOne({ _id: this.message.chat.id, users: userId });
    }
  }

  async getUsers() {
    const chat = await this.chats.findOne({ _id: this.message.chat.id }); // отримуємо необхідний чат
    const usersInfo = await thisusers
      .find({ _id: { $in: chat.users } })
      .toArray();

    return usersInfo;
  }

  async printUsers(usersList) {
    let line = "Members rating:";

    if (!usersList) return;

    await usersList.forEach((user) => {
      line =
        line +
        `\n ${user.username || user.first_name || user.last_name}: ${
          user.rating
        }`;
    });

    return line;
  }
};
