const { User } = require('../models/user');
async function deleteUser(user = {id: Number}){
    await User.deleteOne({ user_id: parseInt(user.id) });
}

module.exports = { deleteUser };