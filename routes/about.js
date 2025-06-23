const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const aboutDb = process.env.ABOUT_DB;

router.get('/', async (req, res) => {
    try {
        const responseAbout = await notion.databases.query({ database_id: aboutDb });

        const aboutContents = responseAbout.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            bio: page.properties.bio?.rich_text?.[0]?.plain_text || '',
            sec1: page.properties.sec1?.rich_text?.[0]?.plain_text || '',
            sec2: page.properties.sec2?.rich_text?.[0]?.plain_text || '',
            image: page.properties.Image?.url || '',
            pfp: page.properties.pfp?.url || '',
        }));

        const page = responseAbout.results[0];
        const data = page.properties;
        const aboutPageData = {
            aboutTitle: data['page-title']?.rich_text?.[0]?.plain_text || 'Untitled',
            aboutDescription: data['page-description']?.rich_text?.[0]?.plain_text || 'Description',
            aboutKeywords: data['page-keywords']?.rich_text?.[0]?.plain_text || 'Keywords',
            aboutAuthor: data['page-author']?.rich_text?.[0]?.plain_text || 'Henry',
        };

        const locals = {
            title: aboutPageData.aboutTitle,
            description: aboutPageData.aboutDescription,
            keywords: aboutPageData.aboutKeywords,
            author: aboutPageData.aboutAuthor,
        }
        res.render('about', { aboutContents, locals });

    } catch (error) {
        console.error('Error fetching Notion data:', error);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router