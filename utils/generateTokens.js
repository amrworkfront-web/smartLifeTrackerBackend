const jwt = require('jsonwebtoken');

const generateTokens = (res, userId) => {
    const isProduction = process.env.NODE_ENV === 'production';

    const accessExpireStr = process.env.ACCESS_TOKEN_EXPIRE || '15m';
    const refreshExpireStr = process.env.REFRESH_TOKEN_EXPIRE || '7d';

    const parseExpireToMs = (str) => {
        const match = str.match(/^(\d+)([smhd])$/);
        if (!match) return 7 * 24 * 60 * 60 * 1000;
        const val = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's': return val * 1000;
            case 'm': return val * 60 * 1000;
            case 'h': return val * 60 * 60 * 1000;
            case 'd': return val * 24 * 60 * 60 * 1000;
            default: return 7 * 24 * 60 * 60 * 1000;
        }
    };

    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: accessExpireStr }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: refreshExpireStr }
    );

    const accessMaxAge = parseExpireToMs(accessExpireStr);
    const refreshMaxAge = parseExpireToMs(refreshExpireStr);

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: accessMaxAge,
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: refreshMaxAge,
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
