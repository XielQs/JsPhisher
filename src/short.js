const { get } = require("axios");

module.exports = async url => {
	return new Promise(async (resolve, reject) => {
		try {
			let req = await get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`).catch(reject);
			resolve(req.data);
		} catch (e) {
			reject(e);
		}
	});
};
