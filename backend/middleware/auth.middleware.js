import jwt  from "jsonwebtoken";

export const generateToken = (user)=> {
    return jwt.sign(user , process.env.TOKEN)
}

export const jwtMiddleWare = (req,res,next)=> {
    try {
        const token = req.body.token ||  req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).send({error: 'User unauthorized'});
        }

        const decoded = jwt.verify(token, process.env.TOKEN);

        req.user = decoded;
        next();

    } catch (error) {
        console.log("jwt error : " , error.message);
        return res.status(401).json({ error: "Invalid or expired token" });     
    }
}