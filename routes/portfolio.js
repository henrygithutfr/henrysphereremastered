const express = require('express');
const { Client } = require('@notionhq/client');
const router = express.Router();
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const portfolioDb = process.env.NOTION_PORTFOLIO_DATABASE_ID;

// GET ALL PORTFOLIO PROJECTS
router.get('/', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: portfolioDb,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
    });

    const projects = response.results.map(page => {
      const props = page.properties;

      return {
        title: props?.['preview-title']?.title?.[0]?.plain_text || 'Untitled',
        slug: props?.['slug']?.rich_text?.[0]?.plain_text || 'no-slug',
        description: props?.['preview-description']?.rich_text?.[0]?.plain_text || '',
        thumbnail: props?.['preview-thumbnail']?.url || '',
        category: props?.['category']?.rich_text?.[0]?.plain_text || '',

        portfolioTitle: props?.['page-title']?.rich_text?.[0]?.plain_text || '',
        portfolioDescription: props?.['page-description']?.rich_text?.[0]?.plain_text || '',
        portfolioKeywords: props?.['page-keywords']?.rich_text?.[0]?.plain_text || '',
        portfolioAuthor: props?.['page-author']?.rich_text?.[0]?.plain_text || '',
      };
    });

    const page = response.results[0]; // first page that holds page metadata
    const data = page?.properties || {};

    const portfolioPageData = {
      portfolioTitle: data['page-title']?.rich_text?.[0]?.plain_text || 'Portfolio | HenrySphere',
      portfolioDescription: data['page-description']?.rich_text?.[0]?.plain_text || '',
      portfolioKeywords: data['page-keywords']?.rich_text?.[0]?.plain_text || '',
      portfolioAuthor: data['page-author']?.rich_text?.[0]?.plain_text || 'Henry',
    };

    const locals = {
      title: portfolioPageData.portfolioTitle,
      description: portfolioPageData.portfolioDescription,
      keywords: portfolioPageData.portfolioKeywords,
      author: portfolioPageData.portfolioAuthor,
    };

    res.render('portfolio', { projects, locals });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading portfolio');
  }
});

// GET INDIVIDUAL PROJECT BY SLUG
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;

    const response = await notion.databases.query({
      database_id: portfolioDb,
      filter: {
        property: 'slug',
        rich_text: { equals: slug },
      },
    });

    const page = response.results[0];
    if (!page) return res.status(404).send('Project not found');

    const props = page.properties;

    const project = {
      title: props?.['preview-title']?.title?.[0]?.plain_text || 'Untitled',
      slug: props?.['slug']?.rich_text?.[0]?.plain_text || '',
      description: props?.['preview-description']?.rich_text?.[0]?.plain_text || '',
      thumbnail: props?.['preview-thumbnail']?.url || '',
      category: props?.['category']?.rich_text?.[0]?.plain_text || '',

      content1: props?.['mini-page-content-1']?.rich_text?.[0]?.plain_text || '',
      content2: props?.['mini-page-content-2']?.rich_text?.[0]?.plain_text || '',
      content3: props?.['mini-page-content-3']?.rich_text?.[0]?.plain_text || '',
      content4: props?.['mini-page-content-4']?.rich_text?.[0]?.plain_text || '',
      content5: props?.['mini-page-content-5']?.rich_text?.[0]?.plain_text || '',
      content6: props?.['mini-page-content-6']?.rich_text?.[0]?.plain_text || '',
      content7: props?.['mini-page-content-7']?.rich_text?.[0]?.plain_text || '',
      content8: props?.['mini-page-content-8']?.rich_text?.[0]?.plain_text || '',
      content9: props?.['mini-page-content-9']?.rich_text?.[0]?.plain_text || '',
      content10: props?.['mini-page-content-10']?.rich_text?.[0]?.plain_text || '',
      content11: props?.['mini-page-content-11']?.rich_text?.[0]?.plain_text || '',
      content12: props?.['mini-page-content-12']?.rich_text?.[0]?.plain_text || '',

      miniLink1: props?.['mini-link-1']?.url || '',
      miniLink2: props?.['mini-link-2']?.url || '',
      miniLink3: props?.['mini-link-3']?.url || '',
      miniLink4: props?.['mini-link-4']?.url || '',
      miniLink5: props?.['mini-link-5']?.url || '',
      miniLink6: props?.['mini-link-6']?.url || '',
      miniLink7: props?.['mini-link-7']?.url || '',
      miniLink8: props?.['mini-link-8']?.url || '',
      miniLink9: props?.['mini-link-9']?.url || '',
      miniLink10: props?.['mini-link-10']?.url || '',
      miniLink11: props?.['mini-link-11']?.url || '',
      miniLink12: props?.['mini-link-12']?.url || '',

      miniThumbnail1: props?.['mini-thumbnail-1']?.url || '',
      miniThumbnail2: props?.['mini-thumbnail-2']?.url || '',
      miniThumbnail3: props?.['mini-thumbnail-3']?.url || '',
      miniThumbnail4: props?.['mini-thumbnail-4']?.url || '',
      miniThumbnail5: props?.['mini-thumbnail-5']?.url || '',
      miniThumbnail6: props?.['mini-thumbnail-6']?.url || '',
      miniThumbnail7: props?.['mini-thumbnail-7']?.url || '',
      miniThumbnail8: props?.['mini-thumbnail-8']?.url || '',
      miniThumbnail9: props?.['mini-thumbnail-9']?.url || '',
      miniThumbnail10: props?.['mini-thumbnail-10']?.url || '',
      miniThumbnail11: props?.['mini-thumbnail-11']?.url || '',
      miniThumbnail12: props?.['mini-thumbnail-12']?.url || '',


      visitLink: props?.['visit link']?.url || '',

      miniTitle: props?.['mini-page-title']?.rich_text?.[0]?.plain_text || '',
      miniPortfolioDescription: props?.['mini-page-description']?.rich_text?.[0]?.plain_text || '',
      miniPortfolioKeywords: props?.['mini-page-keywords']?.rich_text?.[0]?.plain_text || '',
      miniPortfolioAuthor: props?.['mini-page-author']?.rich_text?.[0]?.plain_text || 'Henry',
    };

    const locals = {
      title: project.title,
      description: project.miniPortfolioDescription,
      keywords: project.miniPortfolioKeywords,
      author: project.miniPortfolioAuthor,
    };

    res.render('portfolio-item', { project, locals });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading project');
  }
});

module.exports = router;
