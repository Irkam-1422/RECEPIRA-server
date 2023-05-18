let users = []

const findUser = (user) => {
    const userEmail = user.email
    const userPassword = user.password

    return users.find(
        (u) => u.email === userEmail && user.password === userPassword
    )
}

const addUser = (user) => {
    const isExist = findUser(user)
    !isExist && users.push(user)

    const currentUser = isExist || user
    return { isExist: !!isExist, user: currentUser }
}

const removeUser = (user) => {
    const found = findUser(user)
    if (found) {
        users = users.filter(
            ({email,password}) => email === found.email && password !== found.password
        )
    }
    return found
}

module.exports = {addUser,findUser,removeUser}