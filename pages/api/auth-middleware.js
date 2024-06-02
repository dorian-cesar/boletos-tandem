import { verifyToken } from 'utils/jwt-auth';

const allowedOrigins = ['https://www.pullmanbus.cl', 'https://www.pullman.cl', 'http://128.1.0.190', 'http://128.1.0.191'];

export const authMiddleware = handler => async (req, res) => {
    try {
        const header = req.headers.authorization || req.headers.Authorization;
        const token = req.query.token;

        const referer = req.headers.referer;

        if( !referer || !allowedOrigins.some(d => referer.startsWith(d)) ) {
            return res.status(401).json({ message: 'Not Allowed' });
        }

        if (!header) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        if (!token) {
            return res.status(401).json({ message: 'Authorization missing' });
        }

        const jwt = header.split(" ")[1];
        if (!verifyToken(jwt) || !verifyToken(token)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return handler(req, res);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
