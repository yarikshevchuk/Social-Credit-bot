const cron = require("node-cron");
const DailyUpdates = require("./automatedFunctions/dailyUpdates.js");

cron.schedule("0 37 22 * * *", async () => {
  // DailyUpdates.adjustRating();
});
