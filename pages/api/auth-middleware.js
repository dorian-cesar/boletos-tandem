import { verifyToken } from 'utils/jwt-auth';

const allowedOrigins = ['http://staging.pullman.cl', 'http://localhost:3000' ,'https://boletosparaguay.com', 'https://www.pullman.cl', 'http://128.1.0.190', 'http://128.1.0.191'];

const rateLimitMap = new Map();
const limit = 15;
const windowMs = 60 * 1000;

export const authMiddleware = handler => async (req, res) => {
    try {
        const header = req.headers.authorization || req.headers.Authorization;

        const referer = req.headers.origin;

        const forwarded = req.headers['x-forwarded-for'];
        const realIp = req.headers['x-real-ip'];
        const remoteAddress = req.connection.remoteAddress;

        console.log('IP:::', forwarded, realIp, remoteAddress);

        // if (!rateLimitMap.has(forwarded)) {
        //     rateLimitMap.set(forwarded, {
        //         count: 0,
        //         lastReset: Date.now(),
        //     });
        // }
        
        // const ipData = rateLimitMap.get(forwarded);

        // console.log('IPDATA:::', JSON.stringify(ipData));
        
        // if (Date.now() - ipData.lastReset > windowMs) {
        //     ipData.count = 0;
        //     ipData.lastReset = Date.now();
        // }
        
        // if (ipData.count >= limit) {
        //     return res.status(429).json({ message: "Too Many Requests"});
        // }
        
        // ipData.count += 1;

        // if( !referer || !allowedOrigins.some(d => referer.startsWith(d)) ) {
        //     return res.status(401).json({ message: 'Not Allowed' });
        // }

        if (!header) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const jwt = header.split(" ")[1];
        if ( !verifyToken(jwt) ) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return handler(req, res);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
