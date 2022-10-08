const DataProcessing = require("./data_processing");
const userSchema = require("./schemas/user_schema");

module.exports = class User {
  constructor(chats, users, message) {
    this.chats = chats;
    this.users = users;
    this.message = message;
    this.dataProcessing = new DataProcessing(message);
  }

  async add(currentRating = 0) {
    const userData = this.dataProcessing.extractSenderData();
    const user = await this.users.findOne({ _id: userData._id });

    if (user) return;

    userData.prevRating = 0;
    userData.currentRating = currentRating;
    await this.users.insertOne(userData);

    console.log("user added");
  }

  async update(currentRating = 0, target) {
    let userData;

    if (target === "receiver") {
      userData = this.dataProcessing.extractReceiverData();
    } else if (target === "sender") {
      userData = this.dataProcessing.extractSenderData();
    } else {
      return;
    }

    const user = await this.users.findOne({
      _id: userData._id,
    });

    if (user) {
      user.prevRating = user.currentRating;
      user.currentRating += currentRating;
      await this.users.updateOne({ _id: userData._id }, { $set: user });
      await this.updateChat(user);

      console.log("data updated");
    } else {
      userData.prevRating = 0;
      userData.currentRating = currentRating;
      await this.users.insertOne(userData);
      await this.updateChat(userData);

      console.log("user added but you shouldn't see it");
    }
  }

  async get() {
    const userData = this.dataProcessing.extractSenderData(this.message);
    const user = await this.users.findOne({ _id: userData._id });

    if (user) {
      return user;
    }

    console.log("user wasn't found");
    return user;
  }

  async updateChat(user) {
    const chat = await this.chats.findOne({ _id: this.message.chat.id });

    if (chat) {
      if (chat.users.includes(user._id)) return;

      await this.chats.updateOne(
        { _id: this.message.chat.id },
        { $push: { users: user._id } }
      );
    } else {
      if (this.message.chat.type === "private") return;
      const userId = [user._id];

      await this.chats.insertOne({ _id: this.message.chat.id, users: userId });
    }
  }

  async getUsers() {
    const chat = await this.chats.findOne({ _id: this.message.chat.id }); // отримуємо необхідний чат
    const usersInfo = await this.users
      .find({ _id: { $in: chat.users } })
      .toArray();

    // const sortedArray = usersInfo.sort(this._sortArr);
    return sortedArray;
  }

  async printUsers(usersList) {
    let line = "Members rating:";

    if (!usersList) return;

    await usersList.forEach((user) => {
      line =
        line +
        `\n ${user.username || user.first_name || user.last_name}: ${
          user.currentRating
        }`;
    });

    return line;
  }

  async sortUsers() {
    await this.users.aggregate([
      { $group: { _id: "$username" } },
      { $sort: { currentRating: -1 } },
    ]);
  }

  _sortArr(a, b) {
    if (a.currentRating > b.currentRating) {
      return -1;
    } else if (a.currentRating < b.currentRating) {
      return 1;
    } else {
      return 0;
    }
  }

  async addViaSchema() {
    await userSchema.create({
      username: "aboba",
      first_name: "bob",
      second_name: "aa",
      rating: {
        currentRating: 50505050,
        prevRating: 0,
      },
    });
    console.log("user added");
  }
  async searchViaSchema() {
    let users = await userSchema.where("username").equals("aboba");
    console.log(users);
  }
};
