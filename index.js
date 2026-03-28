require("./discord/index.js")

process.on("unhandledRejection", err => {
    console.log("[AntiCrash] V1", err);
});
process.on("uncaughtException", err => {
    console.log("[AntiCrash] V2", err);
});
process.on("uncaughtExceptionMonitor", err => {
    console.log("[AntiCrash] V3", err);
});
process.on("multipleResolves", err => err + "1");