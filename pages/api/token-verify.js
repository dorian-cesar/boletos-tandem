import axios from "axios"

export default async (req, res) => {
    try {
        const { token } = JSON.parse(req.body);
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        const { data } = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`)
        const { success } = data;
        if( success ) {
            res.status(200).json({ success });
        } else {
            res.status(400).json({ success, message: 'Token no valido' });
        }
    } catch({ response }){
        res.status(400).json(response.data)
    }
}