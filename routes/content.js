const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const parser = new Parser();

const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const youtubeDb = process.env.NOTION_YOUTUBE_DB;

async function fetchChannelsFromNotion() {
  const response = await notion.databases.query({
    database_id: youtubeDb,
    sorts: [
      {
        property: 'Sort',
        direction: 'ascending',
      },
    ],
  });

  // Extract name and channel ID
  const channels = response.results.map(page => {
    const properties = page.properties;
    return {
      id: page.properties?.['RSS-URL']?.url || '',
      name: properties.Title.title[0]?.plain_text || 'Unnamed Channel',
      channelPfp: page.properties?.['channel-img']?.url || '',
    };
  });

  // Filter out any incomplete entries
  return channels.filter(ch => ch.id && ch.name && ch.channelPfp);
}

router.get('/', async (req, res) => {
  const contentResponse = await notion.databases.query({
    database_id: youtubeDb,
    sorts: [
      {
        property: 'Sort',
        direction: 'ascending',
      },
    ],
  });

  const allFeeds = [];
  const channels = await fetchChannelsFromNotion();

  for (const channel of channels) {
    try {
      const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`);
      const videos = feed.items.slice(0, 6).map(item => ({
        title: item.title,
        link: item.link,
        thumbnail: item.media$thumbnail?.url || '',
        pubDate: item.pubDate,
      }));
      allFeeds.push({ name: channel.name, videos, channelPfp: channel.channelPfp });
    } catch (error) {
      console.error(`Failed to fetch ${channel.name}:`, error.message);
    }
  }
  
  const page = contentResponse.results[0];
  const data = page.properties;
  const singleBlogPageData = {
    contentTitle: data['page-title']?.rich_text?.[0]?.plain_text || 'Untitled',
    contentDescription: data['page-description']?.rich_text?.[0]?.plain_text || 'Description',
    contentKeywords: data['page-keywords']?.rich_text?.[0]?.plain_text || 'Keywords',
    contentAuthor: data['page-author']?.rich_text?.[0]?.plain_text || 'Henry',
  };

  const locals = {
    title: singleBlogPageData.contentTitle,
    description: singleBlogPageData.contentDescription,
    keywords: singleBlogPageData.contentKeywords,
    author: singleBlogPageData.contentAuthor,
  }

  res.render('content', { allFeeds, locals });
});

module.exports = router;
