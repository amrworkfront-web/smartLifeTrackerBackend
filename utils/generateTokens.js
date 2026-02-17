const jwt = require('jsonwebtoken');

const generateTokens = (res, userId) => {
    const isProduction = process.env.NODE_ENV === 'production';

    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
    );

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge:7* 24 * 60 * 60 * 1000, 
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

const clearTokens = (res) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        expires: new Date(0),
    });

    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        expires: new Date(0),
    });
};

module.exports = { generateTokens, clearTokens };
