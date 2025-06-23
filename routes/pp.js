const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>{
    const locals = {
        title: "Privacy & Policies",
        description: "Privacy & Policies"
    }
    res.render('pp', { locals })
})

module.exports = router