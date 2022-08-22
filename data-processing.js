module.exports = class DataProcessing {
  constructor(message) {
    this.message = message;
  }

  extractReplyToData() {
    let {
      reply_to_message: {
        from: { id, username, first_name, last_name },
      },
    } = this.message;

    return {
      _id: id,
      username: username,
      first_name: first_name,
      last_name: last_name,
    };
  }

  extractSenderData() {
    let {
      from: { id, username, first_name, last_name },
    } = this.message;

    return {
      _id: id,
      username: username,
      first_name: first_name,
      last_name: last_name,
    };
  }
};
