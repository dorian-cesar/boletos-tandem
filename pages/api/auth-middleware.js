import { verifyToken } from 'utils/jwt-auth';

export const authMiddleware = handler => async (req, res) => {
    try {
        const header = req.headers.authorization || req.headers.Authorization;
        if (!header) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const jwt = header.split(" ")[1];
        if (!verifyToken(jwt)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return handler(req, res);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
