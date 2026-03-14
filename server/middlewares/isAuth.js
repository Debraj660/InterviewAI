import jwt from "jsonwebtoken"
const isAuth = async(req, res, next) =>{
    try{
        let {token} = req.cookies;
        if(!token){
            return res.status(400).json({message: "No token found"}) ;
        }
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET) ;
        if(!decodeToken){
            return res.status(400).json({message: "user does'nt have a valid token"}) ;
        }
        req.userId = decodeToken.userId ;
        next();
    }catch(error){
        console.log(`${error}`);
    }
}

export default isAuth ;