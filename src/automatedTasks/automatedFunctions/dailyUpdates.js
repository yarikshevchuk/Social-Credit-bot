const User = require("../../methods/user.js");
const usersTree = require("../../dataProcessing/usersTree.js");

module.exports = class {
  static async adjustRating() {
    try {
      const start = Date.now();

      const users = await User.getAllUsers();
      await usersTree.set(users);

      for (let i = 0; i < users.length; i++) {
        await User.updateEnvironment(users[i]);
        await User.adjustToEnvironment(users[i]);
      }

      const end = Date.now() - start;
      return console.log(
        `Rating was adjusted for everone in ${end} milliseconds`
      );
    } catch (error) {
      console.log(error);
    }
  }
};
