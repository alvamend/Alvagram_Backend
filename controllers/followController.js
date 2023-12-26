const { default: mongoose } = require('mongoose');
const Follow = require('../models/Follows');
const User = require('../models/User');


const handleFollow = async (req, res) => {

    const { username } = req.body;

    try{
        const userExists = await User.findOne({username:username}).select({password:0, role:0});
        if(!userExists){
            return res.sendStatus(404)
        }else{
            const followingUser = await Follow.create({
                userFollowing: req.user.sub,
                userFollowed: userExists._id
            })
            if(followingUser){
                return res.sendStatus(200)
            }else{
                return res.sendStatus(500)
            }
        }
    }catch(error){
        console.error(error);
    }
}

const handleUnfollow = async(req,res) => {

    const followedUser = req.params.id;

    try{
        const id = new mongoose.Types.ObjectId(req.user.sub)
        const followExists = await Follow.findOneAndDelete({userFollowed:followedUser, userFollowing: id})
        
        if(!followExists) return res.sendStatus(503);

        return res.status(200).json({
            message: `Unfollowing user`
        })
    }catch(error){
        console.error(error);
    }

}

module.exports = {
    handleFollow,
    handleUnfollow
}