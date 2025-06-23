const express = require('express');
const { Client } = require('@notionhq/client');
const router = express.Router();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const portfolioDb = process.env.NOTION_PORTFOLIO_DATABASE_ID;

router.get('/', async (req, res) => {

  try {
    const response = await notion.databases.query({
      database_id: portfolioDb,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
    });

    const projects = response.results.map(page => ({
      title: page.properties?.['preview-title']?.title?.[0]?.plain_text || 'Untitled',
      description: page.properties?.['preview-description']?.rich_text?.[0]?.plain_text || '',
      thumbnail: page.properties?.['preview-thumbnail']?.url || '',
      slug: page.properties?.['slug']?.rich_text?.[0]?.plain_text || '',
      category: page.properties?.['category']?.rich_text?.[0]?.plain_text || '',

      filter1: page.properties?.['filter1']?.rich_text?.[0]?.plain_text || '',
      filter2: page.properties?.['filter2']?.rich_text?.[0]?.plain_text || '',
      filter3: page.properties?.['filter3']?.rich_text?.[0]?.plain_text || '',
      filter4: page.properties?.['filter4']?.rich_text?.[0]?.plain_text || '',
      filter5: page.properties?.['filter5']?.rich_text?.[0]?.plain_text || '',
    }));


    const portfolioResponse = await notion.databases.query({
      database_id: portfolioDb,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
    });

    const page = portfolioResponse.results[0];
    const data = page.properties;
    const portfolioPageData = {
      portfolioTitle: data?.['page-title']?.rich_text?.[0]?.plain_text || 'My Portfolio | HenrySphere',
      portfolioDescription: data?.['page-description']?.rich_text?.[0]?.plain_text || 'Browse my portfolio showcasing web development projects, content creation, graphic designs, and other creative work. Discover what I’ve built and collaborated on as a developer and content creator.',
      portfolioKeywords: data?.['page-keywords']?.rich_text?.[0]?.plain_text || 'portfolio, web development, projects, designs, content creation, HenrySphere, developer portfolio, graphic design, coding projects, creative work, full-stack developer',
      portfolioAuthor: data?.['page-author']?.rich_text?.[0]?.plain_text || 'Henry',
    };

    const locals = {
      title: portfolioPageData.portfolioTitle,
      description: portfolioPageData.portfolioDescription,
      keywords: portfolioPageData.portfolioKeywords,
      author: portfolioPageData.portfolioAuthor,
    }

    res.render('portfolio', { projects, locals });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load portfolio');
  }
});

module.exports = router;
