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
	const keywords = new Set();

	words.forEach((w) => keywords.add(w));
	keywords.add(clean);

	if (words.length > 1) {
		for (let i = 0; i < words.length - 1; i++) {
			keywords.add(words[i] + ' ' + words[i + 1]);
		}
	}

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

// Crawl
async function crawlPage(url, maxSublinks = 5) {
	try {
		const res = await axios.get(url, { timeout: 1500 });
		const $ = cheerio.load(res.data);

		$('script, style, noscript').remove();

		// Main page title and content
		const title = $('title').text().trim() || 'No Title';
		const content = $('body').text().replace(/\s+/g, ' ').trim();
		const metaKeywords = extractKeywords($);
		const titleKeywords = generateTitleKeywords(title);
		const keywords = [...new Set([...metaKeywords, ...titleKeywords])];

		// Normalize main URL
		const mainNormalized = url.replace(/\/$/, '');
		const baseOrigin = new URL(url).origin;

		// Deduplicate and clean sublinks
		const rawLinks = $('a[href]')
			.map((_, el) => $(el).attr('href'))
			.get()
			.filter(Boolean);

		const sublinks = [];
		const seen = new Set();
		seen.add(mainNormalized);

		for (const href of rawLinks) {
			try {
				const linkUrl = new URL(href, url).href;
				const normalized = linkUrl.replace(/\/$/, '');

				// Only internal links
				if (!normalized.startsWith(baseOrigin)) continue;

				// Skip duplicates and main page
				if (seen.has(normalized)) continue;
				seen.add(normalized);

				const subRes = await axios.get(normalized, { timeout: 1500 });
				const $$ = cheerio.load(subRes.data);
				$$('script, style, noscript').remove();

				let subTitle = $$('title').text().trim() || normalized.split('/').pop() || 'No Title';

				subTitle = subTitle.replace(/^Server\s*\d+\s*\|\s*/, '');

				const subContent = $$('body').text().replace(/\s+/g, ' ').trim().slice(0, 200);

				sublinks.push({
					url: normalized,
					title: subTitle,
					content: subContent,
				});

				if (sublinks.length >= maxSublinks) break;
			} catch {}
		}

		return {
			main: {
				url: mainNormalized,
				title,
				content: content.slice(0, 3000),
				keywords,
				domain: extractDomain(url),
				indexedAt: new Date(),
			},
			sublinks,
		};
	} catch {
		return null;
	}
}

// Check all ports
async function checkHost(ip) {
	const sites = [];
	const seen = new Set();

	for (const port of PORTS) {
		const url = `http://${ip}:${port}`;
		const mainPage = await crawlPage(url);
		if (!mainPage) continue;

		const id = `${ip}:${port}`; // unique per server instance
		if (seen.has(id)) continue;
		seen.add(id);

		sites.push({
			main: mainPage.main,
			sublinks: mainPage.sublinks || [],
		});
	}

	return sites.length > 0 ? sites : null;
}

// Scan entire LAN with concurrency
async function scanLAN() {
	const found = [];
	const limit = pLimit(30);
	const promises = [];

	for (let i = 1; i < 255; i++) {
		const ip = BASE_IP + i;
		promises.push(
			limit(async () => {
				const sites = await checkHost(ip);
				if (sites) {
					for (const site of sites) {
						const flatSite = {
							url: site.main.url,
							title: site.main.title,
							content: site.main.content,
							keywords: site.main.keywords,
							domain: site.main.domain,
							indexedAt: site.main.indexedAt,
							sublinks: site.sublinks || [],
						};
						console.log('Indexed:', flatSite.url, '| Sublinks:', flatSite.sublinks.length);
						found.push(flatSite);
					}
				}
			})
		);
	}

	await Promise.all(promises);
	return found;
}

module.exports = scanLAN;
