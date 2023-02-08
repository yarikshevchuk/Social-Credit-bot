const cron = require("node-cron");

cron.schedule("0 0 0 * * *", async () => {
  console.log("Well done, soulmate");
});
