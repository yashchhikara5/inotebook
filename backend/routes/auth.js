const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "Harryisagoodboy";

//Create a User using: POST "/api/auth/createuser". Doesn't require Auth
router.post('/createuser',[
    //Giving restrictions using express validator
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) =>{//making the function asynchronous
    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    
    //Wrapping whole block in a try and catch block
    try {
        
        //Check whether the user with same email exists already
        let user = await User.findOne({email: req.body.email})
        if(user){
            return res.status(400).json({error: "Sorry a user with this email already exists"})
        }
        //Creating a user using the endpoint createuser and schema User
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt) 

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })

        const data = {
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);


        // res.json(user)
        res.json({authToken})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }
})

module.exports = router