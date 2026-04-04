
const usermodel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const { get } = require("mongoose")

/** 
 * @name registerUserController
 * @description resgister a new user, expects username, email and password in the request body
 * @access public
*/
async function registerUserController(req,res){
    const {username,email,password}=req.body
    if(!username || !email || !password){
        return res.status(400).json({
            message:" Username, email and password are required"
        })
    }
    const isuserAlreadyExist=await usermodel.findOne({
        $or:[
            {username},
            {email}]
    })
    if(isuserAlreadyExist){
        return res.status(409).json({
            message:"User with the same username or email already exists"
        })
    }
   const hash =await bcrypt.hash(password,10)
   const user=await usermodel.create({
    username,
    email,
    password:hash
   }) 
   const token=jwt.sign(
    {
        id:user._id,
        username:user.username},
        process.env.JWT_SECRET,
        {
            expiresIn:"1d"
        }
    )
    res.cookie("token",token)
    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
        
    })
}
/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access public
 */
async function loginUserController(req,res){
    const {email,password}=req.body
    if(!email || !password){
        return res.status(400).json({ message: "Email and password are required" })
    }

    // include password when fetching the user because schema sets password `select: false`
    const user = await usermodel.findOne({ email }).select('+password')

    if(!user){
        return res.status(404).json({ message: "User not found" })
    }

    // user.password should now be the hashed password from DB
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid){
        return res.status(401).json({
            message:"Invalid password"
        })
    }
    const token=jwt.sign(
        {
            id:user._id,
            username:user.username},
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        )
        res.cookie("token",token)
        // don't return the password in the response
        res.status(200).json({
            message: "User loggedIn successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        })
}

/**
 * @name logoutUserController
 * @description clear token from cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    try {
        // Attempt to extract token from cookie header (cookie-parser may not be installed)
        let token
        const cookieHeader = req.headers && req.headers.cookie
        if (cookieHeader) {
            const match = cookieHeader.match(/token=([^;]+)/)
            if (match) token = match[1]
        }

        // If we found a token, add it to blacklist (optional)
        if (token) {
            try {
                await tokenBlacklistModel.create({ token })
            } catch (err) {
                // non-fatal: blacklist storage failed
                console.error('Failed to write token to blacklist:', err.message || err)
            }
        }

        // Clear the cookie on client
        res.clearCookie('token')
        return res.status(200).json({ message: 'User logged out successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to logout' })
    }
}
/**
 * 
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req,res){

    const user=await usermodel.findById(req.user.id)

    res.status(200).json({
        message:"User details fetched successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })

}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}