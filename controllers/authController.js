const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { generateTokens, clearTokens } = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(409);
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });

    generateTokens(res, user._id);

    res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateTokens(res, user._id);
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    clearTokens(res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no refresh token');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401);
            throw new Error('Not authorized, user not found');
        }

        generateTokens(res, decoded.userId);

        res.status(200).json({ success: true, message: 'Token refreshed' });
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
