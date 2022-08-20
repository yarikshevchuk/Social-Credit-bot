const addUser = async (chats, users, message, rating = 0) => {
  const userData = extractSenderData(message);
  const user = await users.findOne({ _id: userData._id });

  if (user) return;

  userData.rating = rating;
  await users.insertOne(userData);

  console.log("user added");
};

const updateUser = async (chats, users, message, rating = 0) => {
  const userData = extractReplyToData(message);
  const user = await users.findOne({
    _id: userData._id,
  });

  if (user) {
    user.rating += rating;
    await users.updateOne({ _id: userData._id }, { $set: user });
    await updateChat(chats, message, user);

    console.log("data updated");
  } else {
    userData.rating = rating;
    await users.insertOne(userData);
    await updateChat(chats, message, userData);

    console.log("user added");
  }
};

const updateChat = async (chats, message, user) => {
  const chat = await chats.findOne({ _id: message.chat.id });

  if (chat) {
    if (chat.users.includes(user._id)) return;

    await chats.updateOne(
      { _id: message.chat.id },
      { $push: { users: user._id } }
    );
  } else {
    const userId = [user._id];

    await chats.insertOne({ _id: message.chat.id, users: userId });
  }
};

const getUser = async (users, message) => {
  const userData = extractSenderData(message);
  const user = await users.findOne({ _id: userData._id });

  if (user) {
    return user;
  }

  console.log("user wasn't found");
  return "";
};

const getUsers = async (chats, users, message) => {
  const chat = await chats.findOne({ _id: message.chat.id }); // отримуємо необхідний чат
  const usersInfo = await users.find({ _id: { $in: chat.users } }).toArray();

  return usersInfo;
};

const printUsers = async (usersList) => {
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
};

const checkData = (message) => {
  if (message.from.is_bot) return false;
  if (!message.reply_to_message) return false;
  if (message.reply_to_message.from.is_bot) return false;
  if (message.chat.type === "private") return false;
  // if (message.reply_to_message.from.id === message.from.id) return false;
  return true;
};

const extractReplyToData = (message) => {
  let {
    reply_to_message: {
      from: { id, username, first_name, last_name },
    },
  } = message;

  return {
    _id: id,
    username: username,
    first_name: first_name,
    last_name: last_name,
  };
};

const extractSenderData = (message) => {
  let {
    from: { id, username, first_name, last_name },
  } = message;

  return {
    _id: id,
    username: username,
    first_name: first_name,
    last_name: last_name,
  };
};

module.exports = {
  addUser,
  updateUser,
  getUser,
  getUsers,
  printUsers,
  checkData,
};
