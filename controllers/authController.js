const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const DBError = require('../utils/DBError');
const User = require('../schemas/user');
const NODE_ENV = process.env.NODE_ENV;

const signJwt = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES
    })
}

const sendToken = (user,statusCode,req,res)=>{
    const token = signJwt(user._id);
    const options = {
        expires:new Date(Date.now()+process.env.JWT_EXPIRATION_NUM),
        secure:NODE_ENV==="production"?true:false,
        httpOnly:NODE_ENV==="production"?true:false
    }
    res.cookie('jwt',token,options);
    user.password = undefined;
    res.status(statusCode).json({
        status:'success',
        token,
        user
    })
}

const encryPw = async (password)=>{
    return await bcrypt.hash(password,12);
}

exports.signup = async (req,res)=>{
    const {email,password} = req.body;
    const pw = await encryPw(password);
    try{
        const newUser = await User.create({
            email,
            password:pw
        });
        sendToken(newUser,201,req,res);
    }
    catch(err){
        console.log(err.name);
        let errorHandled = err;
        if(err.name==="MongoError"){
            errorHandled = DBError(err);
            console.log("sdfhjsh");
            console.log(errorHandled);
        }
        res.status(401).json({
            message:errorHandled
        });
    }
};

exports.login = async (req,res)=>{
    const {email,password} = req.body;
    console.log("LOGINNNNN!!!!!!!");
    try{
        const user = await User.findOne({email}).select('+password');
        const compared = await bcrypt.compare(password,user.password);
        compared
            ? sendToken(user,200,req,res)
            : res.status(400).json({message:"Login failed"})
    }
    catch(err){
        console.log(err);
        res.status(400).json({message:err.message});
    }
}

exports.logout = async (req,res)=>{
    const options = {
        expires:new Date(Date.now()+10000),
        secure:NODE_ENV==="production"?true:false,
        httpOnly:NODE_ENV==="production"?true:false
    }
    res.cookie('jwt','expiredtoken',options);
    res.status(200).json({status:"success"});
}

exports.secretContent = (req,res)=>{
    console.log("REQ USER");
    console.log(req.user);
    res.status(200).json({status:"secret content shown!!!!!"});
}

exports.secure = async (req,res,next)=>{
    console.log("came here to secret "+req.cookies.jwt);
    let token;
    if(req.cookies) token = req.cookies.jwt;
    if(!token || token==="expiredtoken"){
        return res.status(401).json({
            status:"unauthorised",
            message:"You are not authorised to view this content"
        });
    } 
    const jwtInfo = jwt.verify(token,process.env.JWT_SECRET);
    console.log(jwtInfo);
    console.log(jwtInfo);
    const user = await User.findById(jwtInfo.id);
    if(!token){
        return res.status(401).json({
            status:"unauthorised",
            message:"You are not authorised to view this content"
        });
    } 
    console.log("user from the ");
    console.log(user);
    req.user = user;
    next();
}

exports.clearanceLevel = (...clearanceLevel) => {
    return (req,res,next)=>{
        console.log(req.user);
        clearanceLevel.includes(req.user.clearance)
        ? next()
        :
        res.status(401).json({
            status:"unauthorised",
            message:"Content available at your clearance level"
        });
    }
}

exports.blacklist = (...inputs)=>{
    console.log(inputs);
    return (req,res,next)=>{
        const {body} = req;
        console.log(body);
        let bodyProps;
        for(let prop in inputs){
            bodyProps = inputs[prop];
            console.log(bodyProps);
            if(body[bodyProps]) delete body[bodyProps];
        }
        console.log(req.body);
        next();
    }
}