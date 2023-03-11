const DataProcessing = require("../dataProcessing/dataSampling");
const UserModel = require("../models/userModel");

module.exports = class PromocodeMethods {
  static async updateRating(message, rating) {
    try {
      let userData = await DataProcessing.extractSenderData(message);

      let user = await UserModel.findOne({ _id: userData._id });

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
