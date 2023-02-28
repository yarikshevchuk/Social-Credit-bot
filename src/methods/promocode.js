const DataProcessing = require("../dataProcessing/dataSampling");
const UserModel = require("../models/userModel");

module.exports = class PromocodeMethods {
  static async updateRating(message, rating) {
    try {
      let userData = DataProcessing.extractSenderData(message);

      let users = await UserModel.where("_id").equals(userData._id);
      let user = users[0];

      user.rating.prevRating = user.rating.currentRating;
      user.rating.currentRating += rating;

      // якщо рейтинг користувача нижче нуля, тоді не можна змінювати відлік подарунку
      if (user.rating.currentRating < 0) {
        return await user.save();
      }

      user.giftsCountdown.smallGift -= rating;
      user.giftsCountdown.averageGift -= rating;
      user.giftsCountdown.bigGift -= rating;

      await user.save();
      console.log("data updated");
    } catch (error) {
      console.log(error);
    }
  }
};
