const gifts = require("./gifts.json");

class Gifts {
  constructor(ctx, message, user) {
    this.ctx = ctx;
    this.message = message;
    this.user = user;
  }
  async gift() {
    let gift = this.chooseGift() ? this.chooseGift() : null;
    if (!gift) return;

    const lang = new Language(this.message);
    let language = lang.select();

    await this.ctx.telegram.sendMessage(
      this.message.chat.id,
      `${this.user.username || this.user.first_name} ${language.gifts.response}`
    );
    await this.ctx.telegram.sendPhoto(this.message.chat.id, gift);
    await this.updateCountdown();
  }
  async updateCountdown() {
    if (this.user.giftsCountdown.smallGift <= 0) {
      this.user.giftsCountdown.smallGift = 300;
    }
    if (this.user.giftsCountdown.averageGift <= 0) {
      this.user.giftsCountdown.averageGift = 1000;
    }
    if (this.user.giftsCountdown.bigGift <= 0) {
      this.user.giftsCountdown.bigGift = 5000;
    }
    await this.user.save();
  }
  chooseGift() {
    if (this.user.giftsCountdown.bigGift <= 0) {
      return gifts.bigGifts[this._randomGift(gifts.bigGifts.length)];
    } else if (this.user.giftsCountdown.averageGift <= 0) {
      return gifts.averageGifts[this._randomGift(gifts.averageGifts.length)];
    } else if (this.user.giftsCountdown.smallGift <= 0) {
      return gifts.smallGifts[this._randomGift(gifts.smallGifts.length)];
    }
    return null;
  }
  _randomGift(length) {
    return Math.floor(Math.random() * length);
  }
}
module.exports = Gifts;
