const axios = require('axios');
const cheerio = require('cheerio');
const pLimit = require('p-limit').default;

const BASE_IP = '192.168.29.';
const PORTS = [
	80, 3000, 5000, 5173, 8080, 5174, 5175, 3002, 4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007,
	4008, 4009, 4010, 4011, 4012, 4013, 4014, 4015, 4016, 4017, 4018, 4019, 4020, 4021, 4022, 4023,
	4024, 4025, 4026, 4027, 4028, 4029, 4030, 4031, 4032, 4033, 4034, 4035, 4036, 4037, 4038, 4039,
	4040, 4041, 4042, 4043, 4044, 4045, 4046, 4047, 4048, 4049, 4050, 4051, 4052, 4053, 4054, 4055,
	4056, 4057, 4058, 4059, 4060, 4061, 4062, 4063, 4064, 4065, 4066, 4067, 4068, 4069, 4070, 4071,
	4072, 4073, 4074, 4075, 4076, 4077, 4078, 4079, 4080, 4081, 4082, 4083, 4084, 4085, 4086, 4087,
	4088, 4089, 4090, 4091, 4092, 4093, 4094, 4095, 4096, 4097, 4098, 4099,
];

function extractDomain(url) {
	try {
		return new URL(url).hostname;
	} catch {
		return null;
	}
}

function extractKeywords($) {
	const meta = $('meta[name="keywords"]').attr('content');
	if (!meta) return [];
	return meta.split(',').map((k) => k.trim().toLowerCase());
}

function generateTitleKeywords(title) {
	if (!title) return [];

	const clean = title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
	const words = clean.split(/\s+/).filter(Boolean);

	let keywords = new Set();

	// Add individual words
	words.forEach((w) => keywords.add(w));

	// Add full title
	keywords.add(clean);

	// Add combinations
	if (words.length > 1) {
		for (let i = 0; i < words.length - 1; i++) {
			keywords.add(words[i] + ' ' + words[i + 1]);
		}
	}

	// 🔥 Add common synonyms
	const synonymMap = {
		login: ['sign in', 'signin', 'log in'],
		logout: ['sign out', 'signout'],
		dashboard: ['panel', 'control panel'],
		register: ['signup', 'sign up'],
	};

	words.forEach((word) => {
		if (synonymMap[word]) {
			synonymMap[word].forEach((s) => keywords.add(s));
		}
	});

	return Array.from(keywords);
}

async function checkHost(ip) {
	const foundSites = [];

	await Promise.all(
		PORTS.map(async (port) => {
			try {
				const url = `http://${ip}:${port}`;
				const res = await axios.get(url, { timeout: 1500 });

				const $ = cheerio.load(res.data);
				const title = $('title').text().trim() || 'No Title';

				$('script, style, noscript').remove();
				const content = $('body').text().replace(/\s+/g, ' ').trim();

				const metaKeywords = extractKeywords($);
				const titleKeywords = generateTitleKeywords(title);
				const keywords = [...new Set([...metaKeywords, ...titleKeywords])];

				foundSites.push({
					url,
					domain: extractDomain(url),
					ip,
					port,
					title,
					content: content.slice(0, 3000),
					keywords,
					indexedAt: new Date(),
				});
			} catch (err) {
				// ignore closed ports
			}
		})
	);

	return foundSites;
}


async function scanLAN() {
	let found = [];
	const limit = pLimit(30); // increase concurrency
	const promises = [];

	for (let i = 1; i < 255; i++) {
		const ip = BASE_IP + i;

		promises.push(
			limit(async () => {
				const sites = await checkHost(ip);
				if (sites.length > 0) {
					sites.forEach((site) => {
						console.log('Website indexed:', site.url);
						found.push(site);
					});
				}
			})
		);
	}

	await Promise.all(promises);
	return found;
}

module.exports = scanLAN;
