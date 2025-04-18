
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrokenLinkBot/1.0)',
      },
      timeout: 10000,
    });

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const anchors = Array.from(document.querySelectorAll('a[href]'));
    const links = anchors
      .map(a => a.href)
      .filter(link => link.startsWith('http') && link.includes(new URL(url).hostname));

    const uniqueLinks = [...new Set(links)];
    res.status(200).json({ url, links: uniqueLinks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch or parse URL' });
  }
};
