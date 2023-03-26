const { User } = require('../models/user.js');
async function createUser(userid, name) {
    user_id = parseInt(userid);
    console.log(`[USERS] User creation requested. ID: ${user_id}`.yellow);
    try {
        User.findOne({ 'user_id': parseInt(user_id) }).then(async (user) => {
            if (user) {
                console.log(`[ERROR] User ${user_id} already exists in database, aborting and redirecting to `.red + `/users/info/${user_id}`.blue);
                res.redirect(`/users/info/${user_id}`);
            } else {
                console.log(`[USERS] User ${user_id} not found in database, creating`.yellow);
                try {
                    const newUser = new User({
                        name: name,
                        user_id: parseInt(user_id),
                        claim_time: Date.now(),
                        balance: 0,
                        workers: [],
                        items: {
                            "Welcome Balloon": 1,
                        },
                        sessionToken: null,
                    });
                    await newUser.save();
                    console.log(`[USERS] User ${user_id} (${name}) created in database. `.green + `ObjectID: ${newUser._id}`.blue);
                    return newUser;
                } catch (error) {
                    console.log(`[ERROR] Error creating user ${user_id} in database`.red);
                    next(error);
                    res.send("There was an error creating your user");
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createUser };