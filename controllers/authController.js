const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { generateTokens, clearTokens } = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        generateTokens(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateTokens(res, user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Logout user / clear cookie
// @route   POST /auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    clearTokens(res);
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Refresh access token
// @route   POST /auth/refresh
// @access  Public (Refreshes using the refresh token which is in the cookie)
const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401);
        throw new Error('Not authorized, no refresh token');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // We could also check if the user still exists here
        // const user = await User.findById(decoded.userId);
        
        // Re-issue tokens (Rotate refresh token)
        generateTokens(res, decoded.userId);
        
        res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
        res.status(401);
        throw new Error('Not authorized, invalid refresh token');
    }
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
};
