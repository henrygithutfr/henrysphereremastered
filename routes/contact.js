const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const contactDb = process.env.CONTACT_DB;

router.get('/', async (req, res) => {
    try {
        const responseContact = await notion.databases.query({
            database_id: contactDb,
        });

        const contacts = responseContact.results.map(page => ({
            smTitle: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed Channel',
            smp: page.properties.smp?.rich_text?.[0]?.plain_text || '',
            icons: page.properties.icons?.url || '',
            smUrl: page.properties.smurl?.url || '',
        }));

        const page = responseContact.results[0];
        const data = page.properties;
        const contactPageData = {
            aboutTitle: data['page-title']?.rich_text?.[0]?.plain_text || 'Untitled',
            aboutDescription: data['page-description']?.rich_text?.[0]?.plain_text || 'Description',
            aboutKeywords: data['page-keywords']?.rich_text?.[0]?.plain_text || 'Keywords',
            aboutAuthor: data['page-author']?.rich_text?.[0]?.plain_text || 'Henry',
        };

        const locals = {
            title: contactPageData.aboutTitle,
            description: contactPageData.aboutDescription,
            keywords: contactPageData.aboutKeywords,
            author: contactPageData.aboutAuthor,
        }

        res.render('contact', { contacts, locals });

    } catch (error) {
        console.error('Error fetching Notion data:', error);
        res.status(500).send('Failed to fetch data');
    }
});

router.post('/', async (req, res) => {

    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_GMAIL,
            pass: process.env.CONTACT_APP_PASS,
        },
    });

    const mailOptions = {
        from: {
            name: 'HenrySphere',
            address: process.env.USER_GMAIL
        },
        to: process.env.USER_GMAIL,
        subject: `New Contact Form Submission from ${name}`,
        text: `You got a message from:
Name: ${name}
Email: ${email}
Message: ${message}`,
        html: `<p><b>Name:</b> ${name}</p>
               <p><b>Email:</b> ${email}</p>
               <p><b>Message:</b><br>${message}</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        res.render('contact-success', { success: true });
    } catch (error) {
        console.error("Error sending email:", error);
        res.render('contact-failure', { success: false });
    }

});

module.exports = router;
