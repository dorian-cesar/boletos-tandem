import JWT from 'jsonwebtoken';

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA2
const user = process.env.NEXT_PUBLIC_SECRET_WEB_USR2
const password = process.env.NEXT_PUBLIC_SECRET_WEB_PSSWD

// export function generateToken() {
//     try {
//         const token = JWT.sign({ user: user, password: password }, secret, {
//             algorithm: 'HS256',
//             expiresIn: '1m'
//         });
    
//         return token;
//     } catch (error) {
//         console.error('ERROR:::', error);
//     }
// }

export function generateToken() {
    try {
        const token = JWT.sign({ username: user}, secret, {
            expiresIn: '1m'
        });
    
        return token;
    } catch (error) {
        console.error('ERROR:::', error);
    }
}


export function verifyToken(token) {
    let valid = false;
    JWT.verify(token, secret, (err, decoded) => {
        if( err ) {
            valid =  false;
        } else {   
            valid = true;
        }
    });
    return valid;
}