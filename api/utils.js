function requireUser(req, res, next) {
    if(!req.user) {
        next({
            name: "MissingUserError",
            message: "You must be logged in to peform this action"
        });
    }

    next();
}

module.exports = {
    requireUser
}