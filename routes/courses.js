const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>{
    const locals = {
        title: "My Courses",
        description: "These are my Courses"
    }
    res.render('courses', { locals })
})

module.exports = router