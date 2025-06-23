const express = require('express');
const { Client } = require('@notionhq/client');
const router = express.Router();
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

router.get('/', async (req, res) => {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: 'Published',
                checkbox: {
                    equals: true,
                },
            },
            sorts: [
                {
                    property: 'Date',
                    direction: 'ascending',
                },
            ],
        });

        const posts = response.results.map(page => {
            const titleArray = page.properties?.Title?.title || [];
            const slugArray = page.properties?.Slug?.rich_text || [];
            const contentArray = page.properties?.content?.rich_text || [];
            const descriptionArray = page.properties?.description?.rich_text || [];
            const authorArray = page.properties?.author?.rich_text || [];
            const authorCreditsArray = page.properties?.['author-credits']?.rich_text || [];

            const contentArray2 = page.properties?.['content2']?.rich_text || [];
            const contentArray3 = page.properties?.['content3']?.rich_text || [];
            const contentArray4 = page.properties?.['content4']?.rich_text || [];
            const contentArray5 = page.properties?.['content5']?.rich_text || [];

            const linkArray1 = page.properties?.['link1']?.rich_text || [];
            const linkArray2 = page.properties?.['link2']?.rich_text || [];
            const linkArray3 = page.properties?.['link3']?.rich_text || [];
            const linkArray4 = page.properties?.['link4']?.rich_text || [];
            const linkArray5 = page.properties?.['link5']?.rich_text || [];

            const headingArray1 = page.properties?.['heading1']?.rich_text || [];
            const headingArray2 = page.properties?.['heading2']?.rich_text || [];
            const headingArray3 = page.properties?.['heading3']?.rich_text || [];
            const headingArray4 = page.properties?.['heading4']?.rich_text || [];
            const headingArray5 = page.properties?.['heading5']?.rich_text || [];

            const blogTitleArray = page.properties?.['blog-title']?.rich_text || [];
            const blogDescriptionArray = page.properties?.['blog-description']?.rich_text || [];

            return {
                title: titleArray.length > 0 ? titleArray[0].plain_text : 'Untitled',
                slug: slugArray.length > 0 ? slugArray[0].plain_text : 'no-slug',
                content: contentArray.length > 0 ? contentArray[0].plain_text : 'Empty',
                description: descriptionArray.length > 0 ? descriptionArray[0].plain_text : 'Empty',
                date: page.properties?.Date?.date?.start || 'No date',
                image_url: page.properties?.['Image URL']?.url || '',
                thumbnail: page.properties?.thumbnail?.url || '',
                profile_picture: page.properties?.['pfp']?.url || '',
                author: authorArray.length > 0 ? authorArray[0].plain_text : 'Unknown Author',
                author_credits: authorCreditsArray.length > 0 ? authorCreditsArray[0].plain_text : 'No Credits',
                content2: contentArray2.length > 0 ? contentArray2[0].plain_text : 'Empty',
                content3: contentArray3.length > 0 ? contentArray3[0].plain_text : 'Empty',
                content4: contentArray4.length > 0 ? contentArray4[0].plain_text : 'Empty',
                content5: contentArray5.length > 0 ? contentArray5[0].plain_text : 'Empty',

                link1: linkArray1.length > 0 ? linkArray1[0].plain_text : 'Empty',
                link2: linkArray2.length > 0 ? linkArray2[0].plain_text : 'Empty',
                link3: linkArray3.length > 0 ? linkArray3[0].plain_text : 'Empty',
                link4: linkArray4.length > 0 ? linkArray4[0].plain_text : 'Empty',
                link5: linkArray5.length > 0 ? linkArray5[0].plain_text : 'Empty',

                image_url_one: page.properties?.['ImageURL1']?.url || '',
                image_url2: page.properties?.['ImageURL2']?.url || '',
                image_url3: page.properties?.['ImageURL3']?.url || '',
                image_url4: page.properties?.['ImageURL4']?.url || '',
                image_url5: page.properties?.['ImageURL5']?.url || '',

                heading1: headingArray1.length > 0 ? headingArray1[0].plain_text : '',
                heading2: headingArray2.length > 0 ? headingArray2[0].plain_text : '',
                heading3: headingArray3.length > 0 ? headingArray3[0].plain_text : '',
                heading4: headingArray4.length > 0 ? headingArray4[0].plain_text : '',
                heading5: headingArray5.length > 0 ? headingArray5[0].plain_text : '',

                blogTitle: blogTitleArray.length > 0 ? blogTitleArray[0].plain_text : 'Title',
                blogDescription: blogDescriptionArray.length > 0 ? blogDescriptionArray[0].plain_text : 'Description',
            };
        });

        const page = response.results[0];
        if (!page) return res.status(404).send('No data found in Notion database');
        const data = page.properties;

        const blogPageData = {
            blogTitle: data['blog-title']?.rich_text?.[0]?.plain_text || 'Untitled',
            blogDescription: data['blog-description']?.rich_text?.[0]?.plain_text || 'Description',
            blogKeywords: data['blog-keywords']?.rich_text?.[0]?.plain_text || 'Keywords',
            blogAuthor: data['blog-author']?.rich_text?.[0]?.plain_text || 'Henry',
        };

        const locals = {
            title: blogPageData.blogTitle,
            description: blogPageData.blogDescription,
            keywords: blogPageData.blogKeywords,
            author: blogPageData.blogAuthor,
        }

        res.render('blogs', { posts, locals });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading posts');
    }

});

router.get('/:slug', async (req, res) => {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: 'Slug',
                rich_text: {
                    equals: req.params.slug
                }
            }
        });

        const post = response.results[0];
        const fullPost = {
            title: post.properties?.Title?.title[0]?.plain_text || 'Untitled',
            author: post.properties?.author?.rich_text[0]?.plain_text || 'Unknown Author',
            content: post.properties?.content?.rich_text[0]?.plain_text || '',
            description: post.properties?.description?.rich_text[0]?.plain_text || '',
            date: post.properties?.Date?.date?.start || 'No Date',
            image_url: post.properties?.['Image URL']?.url || '',

            image_url1: post.properties?.['Image URL 1']?.url || '',
            image_url2: post.properties?.['Image URL 2']?.url || '',
            image_url3: post.properties?.['Image URL 3']?.url || '',
            image_url4: post.properties?.['Image URL 4']?.url || '',
            image_url5: post.properties?.['Image URL 5']?.url || '',

            thumbnail: post.properties?.['thumbnail']?.url || '',
            profile_picture: post.properties?.['pfp']?.url || '',
            author_credits: post.properties?.['author-credits']?.rich_text[0]?.plain_text || 'No Credits',
            content2: post.properties?.content2?.rich_text[0]?.plain_text || '',
            content3: post.properties?.content3?.rich_text[0]?.plain_text || '',
            content4: post.properties?.content4?.rich_text[0]?.plain_text || '',
            content5: post.properties?.content5?.rich_text[0]?.plain_text || '',


            link1: post.properties?.['link1']?.rich_text[0]?.plain_text || '',
            link2: post.properties?.['link2']?.rich_text[0]?.plain_text || '',
            link3: post.properties?.['link3']?.rich_text[0]?.plain_text || '',
            link4: post.properties?.['link4']?.rich_text[0]?.plain_text || '',
            link5: post.properties?.['link5']?.rich_text[0]?.plain_text || '',


            heading1: post.properties?.['heading1']?.rich_text[0]?.plain_text || '',
            heading2: post.properties?.['heading2']?.rich_text[0]?.plain_text || '',
            heading3: post.properties?.['heading3']?.rich_text[0]?.plain_text || '',
            heading4: post.properties?.['heading4']?.rich_text[0]?.plain_text || '',
            heading5: post.properties?.['heading5']?.rich_text[0]?.plain_text || '',

            singleBlogDescription: post.properties['single-blog-description']?.rich_text[0]?.plain_text || 'Description',
            singleBlogKeywords: post.properties['single-blog-keywords']?.rich_text[0]?.plain_text || 'Keywords',
            singleBlogAuthor: post.properties['single-blog-author']?.rich_text[0]?.plain_text || 'Henry',

        };

        const data = page.properties;
        const singleBlogPageData = {
            blogTitle: data['blog-title']?.rich_text?.[0]?.plain_text || 'Untitled',
            singleBlogDescription: data['single-blog-description']?.rich_text?.[0]?.plain_text || 'Description',
            singleBlogKeywords: data['single-blog-keywords']?.rich_text?.[0]?.plain_text || 'Keywords',
            singleBlogAuthor: data['single-blog-author']?.rich_text?.[0]?.plain_text || 'Henry',
        };

        
        const locals = {
            title: fullPost.title,
            description: singleBlogPageData.singleBlogDescription,
            keywords: singleBlogPageData.singleBlogKeywords,
            author: singleBlogPageData.singleBlogAuthor,
        }
        res.render('single-blog', { post: fullPost, locals });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading post');
    }
});

module.exports = router