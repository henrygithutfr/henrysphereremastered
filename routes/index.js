const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const databaseId = process.env.HOME_DB;
const blogDbId = process.env.NOTION_DATABASE_ID;
const portfolioDb = process.env.NOTION_PORTFOLIO_DATABASE_ID;
const youtubeDb = process.env.NOTION_YOUTUBE_DB;
const aboutDb = process.env.ABOUT_DB;
const contactDb = process.env.CONTACT_DB;

router.get('/', async (req, res) => {
    try {
        const responseAbout = await notion.databases.query({ database_id: aboutDb });

        const responseCon = await notion.databases.query({
            database_id: youtubeDb,
            page_size: 6,
            sorts: [{ property: 'Sort', direction: 'ascending' }]
        });

        const responsePort = await notion.databases.query({
            database_id: portfolioDb,
            page_size: 6,
            filter: { property: 'Published', checkbox: { equals: true } }
        });

        const response = await notion.databases.query({ database_id: databaseId });

        const responseContact = await notion.databases.query({
            database_id: contactDb,
        });


        const page = response.results[0];
        if (!page) return res.status(404).send('No data found in Notion database');

        const data = page.properties;

        const homepageData = {
            title: data.Title?.title?.[0]?.plain_text || 'Untitled',
            description: data.description?.rich_text?.[0]?.plain_text || '',
            author: data.author?.rich_text?.[0]?.plain_text || '',
            keywords: data.keywords?.rich_text?.[0]?.plain_text || '',
            heroTitle: data['Hero-Title']?.rich_text?.[0]?.plain_text || '',
            heroDescription: data['Hero-Description']?.rich_text?.[0]?.plain_text || '',
            heroImage: data['Hero-Image']?.url || ''
        };

        const locals = {
            title: homepageData.title,
            description: homepageData.description,
            keywords: homepageData.keywords,
            author: homepageData.author,
        };

        const blogRes = await notion.databases.query({
            database_id: blogDbId,
            page_size: 6,
            sorts: [{ property: 'Date', direction: 'ascending' }]
        });

        const posts = blogRes.results.map(page => {
            const props = page.properties;
            return {
                title: props.Title?.title?.[0]?.plain_text || 'Untitled',
                slug: props.Slug?.rich_text?.[0]?.plain_text || 'no-slug',
                content: props.content?.rich_text?.[0]?.plain_text || '',
                description: props.description?.rich_text?.[0]?.plain_text || '',
                date: props.Date?.date?.start || 'No date',
                image_url: props['Image URL']?.url || '',
                thumbnail: props.thumbnail?.url || '',
                profile_picture: props.pfp?.url || '',
                author: props.author?.rich_text?.[0]?.plain_text || 'Unknown Author',
                author_credits: props['author-credits']?.rich_text?.[0]?.plain_text || 'No Credits'
            };
        });

        const projects = responsePort.results.map(page => {
            const props = page.properties;
            return {
                title: props['preview-title']?.title?.[0]?.plain_text || 'Untitled',
                description: props['preview-description']?.rich_text?.[0]?.plain_text || '',
                thumbnail: props['preview-thumbnail']?.url || '',
                slug: props.slug?.rich_text?.[0]?.plain_text || '',
                category: props.category?.rich_text?.[0]?.plain_text || '',
                filter1: props.filter1?.rich_text?.[0]?.plain_text || '',
                filter2: props.filter2?.rich_text?.[0]?.plain_text || '',
                filter3: props.filter3?.rich_text?.[0]?.plain_text || '',
                filter4: props.filter4?.rich_text?.[0]?.plain_text || '',
                filter5: props.filter5?.rich_text?.[0]?.plain_text || ''
            };
        });

        const contents = responseCon.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed Channel',
            description: page.properties.description?.rich_text?.[0]?.plain_text || '',
            banner: page.properties.banner?.url || '',
            titleLow: (page.properties.Title?.title?.[0]?.plain_text || 'Unnamed Channel').toLowerCase()
        }));

        const contacts = responseContact.results.map(page => ({
            smTitle: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed Channel',
            smp: page.properties.smp?.rich_text?.[0]?.plain_text || '',
            icons: page.properties.icons?.url || '',
            smUrl: page.properties.smurl?.url || '',
        }));

        const aboutContents = responseAbout.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            bio: page.properties.bio?.rich_text?.[0]?.plain_text || '',
            image: page.properties.Image?.url || ''
        }));

        res.render('home', { homepageData, posts, projects, contents, aboutContents, contacts, locals });

    } catch (error) {
        console.error('Error fetching Notion data:', error);
        res.status(500).send('Failed to fetch data');
    }
});

router.get('/blogs/:slug', async (req, res) => {
    try {
        const homepageRes = await notion.databases.query({ database_id: databaseId });
        const homepagePage = homepageRes.results[0];
        const homepageProps = homepagePage?.properties || {};

        const homepageData = {
            logo: homepageProps.Logo?.url || '',
            title: homepageProps.Title?.title?.[0]?.plain_text || 'Untitled',
            heroTitle: homepageProps['Hero-Title']?.rich_text?.[0]?.plain_text || '',
            heroDescription: homepageProps['Hero-Description']?.rich_text?.[0]?.plain_text || '',
            heroImage: homepageProps['Hero-Image']?.url || ''
        };

        const response = await notion.databases.query({
            database_id: blogDbId,
            filter: {
                property: 'Slug',
                rich_text: { equals: req.params.slug }
            }
        });

        if (response.results.length === 0) return res.status(404).send('Blog not found');

        const convertToHtml = text => text.replace(/\n/g, '<br>');

        const post = response.results[0];
        const props = post.properties;

        const fullPost = {
            title: props.Title?.title?.[0]?.plain_text || 'Untitled',
            author: props.author?.rich_text?.[0]?.plain_text || 'Unknown Author',
            content: convertToHtml(props.content?.rich_text?.[0]?.plain_text || ''),
            description: convertToHtml(props.description?.rich_text?.[0]?.plain_text || ''),
            date: props.Date?.date?.start || 'No Date',
            image_url: props['Image URL']?.url || '',

            image_url1: props['Image URL 1']?.url || '',
            image_url2: props['Image URL 2']?.url || '',
            image_url3: props['Image URL 3']?.url || '',
            image_url4: props['Image URL 4']?.url || '',
            image_url5: props['Image URL 5']?.url || '',

            thumbnail: props.thumbnail?.url || '',
            profile_picture: props.pfp?.url || '',
            author_credits: props['author-credits']?.rich_text?.[0]?.plain_text || 'No Credits',

            content2: convertToHtml(props.content2?.rich_text?.[0]?.plain_text || ''),
            content3: convertToHtml(props.content3?.rich_text?.[0]?.plain_text || ''),
            content4: convertToHtml(props.content4?.rich_text?.[0]?.plain_text || ''),
            content5: convertToHtml(props.content5?.rich_text?.[0]?.plain_text || ''),

            link1: props.link1?.rich_text?.[0]?.plain_text || '',
            link2: props.link2?.rich_text?.[0]?.plain_text || '',
            link3: props.link3?.rich_text?.[0]?.plain_text || '',
            link4: props.link4?.rich_text?.[0]?.plain_text || '',
            link5: props.link5?.rich_text?.[0]?.plain_text || '',

            heading1: convertToHtml(props.heading1?.rich_text?.[0]?.plain_text || ''),
            heading2: convertToHtml(props.heading2?.rich_text?.[0]?.plain_text || ''),
            heading3: convertToHtml(props.heading3?.rich_text?.[0]?.plain_text || ''),
            heading4: convertToHtml(props.heading4?.rich_text?.[0]?.plain_text || ''),
            heading5: convertToHtml(props.heading5?.rich_text?.[0]?.plain_text || ''),

            singleBlogDescription: post.properties['single-blog-description']?.rich_text[0]?.plain_text || 'Description',
            singleBlogKeywords: post.properties['single-blog-keywords']?.rich_text[0]?.plain_text || 'Keywords',
            singleBlogAuthor: post.properties['single-blog-author']?.rich_text[0]?.plain_text || 'Henry',
        };

        const data = post.properties;
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
        res.render('single-blog', { post: fullPost, homepageData, locals });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading post');
    }
});

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_GMAIL,
            pass: process.env.CONTACT_APP_PASS
        }
    });

    const mailOptions = {
        from: { name: 'HenrySphere', address: process.env.USER_GMAIL },
        to: process.env.USER_GMAIL,
        subject: `New Contact Form Submission from ${name}`,
        text: `You got a message from:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
        html: `<p><b>Name:</b> ${name}</p>
               <p><b>Email:</b> ${email}</p>
               <p><b>Message:</b><br>${message}</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully");
        res.render('contact-success', { success: true });
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        res.status(500).render('contact-success', { success: false });
    }

});

module.exports = router;
