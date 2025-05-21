const express = require('express');
const { Client } = require('@notionhq/client');
const router = express.Router();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const portfolioDb = process.env.NOTION_PORTFOLIO_DATABASE_ID;

router.get('/', async (req, res) => {
  const locals = {
        title: "Portfolio",
        description: "This is Henry's Portfolio"
    }
  try {
    const response = await notion.databases.query({
      database_id: portfolioDb,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
    });

    const projects = response.results.map(page => ({
        title: page.properties?.['preview-title']?.title[0]?.plain_text || 'Untitled',
      description: page.properties['preview-description'].rich_text[0]?.plain_text || '',
      thumbnail: page.properties?.['preview-thumbnail']?.url || '',
      slug: page.properties['slug'].rich_text[0]?.plain_text || '',
      category: page.properties['category'].rich_text[0]?.plain_text || '',

      filter1: page.properties['filter1'].rich_text[0]?.plain_text || '',
      filter2: page.properties['filter2'].rich_text[0]?.plain_text || '',
      filter3: page.properties['filter3'].rich_text[0]?.plain_text || '',
      filter4: page.properties['filter4'].rich_text[0]?.plain_text || '',
      filter5: page.properties['filter5'].rich_text[0]?.plain_text || '',
    }));

    res.render('portfolio', { projects , locals});
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load portfolio');
  }
});

module.exports = router;
