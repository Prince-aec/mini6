import User from '../schema/userSchema.js'
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../constants.js';

/**
 * post-> createUser
 * post-> login
 * put-> getUserById
 * put-> updateUser
 * delete-> deleteUser
 * get-> getQueriesOfUser
 * get-> getSuggestionsOfUser
 */
export const getSuggestionsOfUser = async (req,res)=>{
    console.log(req.params);
    try {
        const _id = req.params.id;
        const posts = await User.findById(_id)
                                .select('posts')
                                .populate('posts');
        
        posts.posts = posts.posts.filter((post)=>{
            return post.category =='suggestion';
        });
    
        res.status(200).json(posts);
    } catch (e) {
        res.status(400).json({error:e});
    }
}

export const getQueriesOfUser = async (req,res)=>{
    console.log(req.params);
    try {
        const _id = req.params.id;
        const posts = await User.findById(_id)
                                .select('posts')
                                .populate('posts');
        
        posts.posts = posts.posts.filter((post)=>{
            return post.category =='query';
        });
    
        res.status(200).json(posts);
    } catch (e) {
        res.status(400).json({error:e});
    }
}

export const deleteUser = async (req,res)=>{
    
    console.log(req.userId);

    try{

        await User.deleteOne({_id:req.userId});
        res.status(200).json({message:'success'});
    }catch(e){
        console.log(e);
        res.status(400).json({error:e});
    }
}

export const updateUser = async (req,res)=>{
    console.log(req.body);
    try{
        const user = await User.updateOne({_id:req.userId},req.body);
        res.status(200).json({message:'success'});
    }catch(e){
        console.log(e);
        res.status(400).json({error:e});
    }
}

export const follow = async (req,res)=>{
    
    //we will get userId (the person who wants to follow _id) from authentication
    //and _id (person who is followed) through params

    console.log(req.params);

    try{
        const _id = req.params.id;
        
        if(_id === req.userId){
            return res.status(200).json({message: 'cannot follow himself'});
        }

        await User.updateOne(
            {
                _id : req.userId,
            },
            {
                $addToSet : {
                    followings : [_id]
                }
            }
        );

        await User.updateOne(
            {
                _id : _id,
            },
            {
                $addToSet : {
                    followers : [req.userId],
                }
            }
        );
        
        res.status(200).json({message: 'success'});

    }catch(e){
        console.log(e);
        res.status(400).json({error:e});
    }

}

export const getUserById = async (req,res)=>{

    console.log(req.params);

    try{
        
        const _id = req.params.id;
        
        const user = await User.findById(_id).select('-password');

        if(!_id || !user){
            return res.status(400).json({error:'count not find anything'});
        }

        res.status(200).json({user});

    }catch(e){
        res.status(400).json({error: e});
    }
}

export const login = async (req,res)=>{
    console.log(req.body);

    try{
        const {email,password} = req.body;
        
        if(!email || !password){
            return res.status(400).json({message: 'enter both email and password'});
        }

        const user =await User.findOne({email:email});

        if(!user || user.password != password){
            return res.status(400).json({message: 'email or password is wrong'});
        }

        const token = jwt.sign({_id:user._id},JWT_SECRET_KEY);
        
        return res.status(200).json({token:token});

    }catch(e)
    {
        console.log(e);
        res.status(400).json({error: e});
    }
}

export const createUser = async (req,res)=>{
    console.log(req.body);

    try{

        //check if user exists
        const userExist = await User.findOne({email:req.body.email});

        if(userExist){
            res.status(400).json({message: 'user already exists'});
        }else{
            let user = new User(req.body);
            await user.save();
            console.log(user);
            res.status(200).json({message: 'user created successfully'});
        }

    }catch(e)
    {
        console.log(e);
        res.status(400).json({error: e});
    }
}