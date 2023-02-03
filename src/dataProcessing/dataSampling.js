module.exports = class DataProcessing {
  static extractReceiverData(message) {
    let {
      reply_to_message: {
        from: { id, username, first_name },
      },
    } = message;

    return {
      _id: id,
      username: username,
      first_name: first_name,
    };
  }

  static extractSenderData(message) {
    let {
      from: { id, username, first_name },
    } = message;

    return {
      _id: id,
      username: username,
      first_name: first_name,
    };
  }
};
