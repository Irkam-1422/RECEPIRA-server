const express = require('express')
const http = require('http')
const cors = require('cors');
const route = require('./route');
const app = express()
const { Server } = require('socket.io');
const { addUser } = require('./users');
const mongoose = require('mongoose')
const User = require('./models/users')
const Post = require('./models/posts')
const Restaurant = require('./models/restaurants')
const Job = require('./models/jobs')

const db = 'mongodb+srv://irkamor2002:Irkam1422@cluster0.3k9w5vy.mongodb.net/?retryWrites=true&w=majority'

mongoose
    .connect(db)
    .then((res) => console.log('Connected to DB'))
    .catch(e => console.log(e))

app.use(cors({ origin: "*" }));
app.use(route)

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    console.log('Connected!');

    var userID = ''
    const currectUser = {id: ''}

    socket.on('getUser', (id) => {
        User.findById(id)
        .then((user) => {
            console.log('Server: finding user by id', id);
            console.log('Server: emmitting user', user._id.toString());
            socket.emit('showUser', user)
        }).catch((e) => console.log(e))
    })

    socket.on('getRestaurant', (id) => {
        Restaurant.
        findById(id)
        .then((restaurant) => {
            console.log('Server: finding restaurant by id', id);
            console.log('Server: emmitting restaurant', restaurant._id.toString());
            socket.emit('showRestaurant', restaurant)
        }).catch((e) => console.log(e))
    })

    socket.on('signup', ({values,type}) => {
        const {name,email,password} = values
        console.log('Server: signup',name,email,password,type);
        if (type == 'cook') {
            User
            .find()
            .then(users => {
                users = users.filter(u => u.name.trim().toLowerCase() === name.trim().toLowerCase() 
                                        && u.email.trim().toLowerCase() === email.trim().toLowerCase()
                                        && u.password.trim().toLowerCase() === password.trim().toLowerCase())
                const isExist = users.length
                if (isExist == 0) {
                    const user = new User({name,email,password})
                    user
                        .save()
                        .then((result) => {
                            currectUser.id = result._id.toString()
                            console.log('Server: emmitting user', result._id.toString());
                            socket.emit('user', {result})
                        })
                        .catch((e) => console.log(e))
                } else {
                    socket.emit('failedToSignUp')
                }
            }).catch(e => console.log(e))
        } else if (type == 'recruiter') {
            Restaurant
            .find()
            .then(rests => {
                rests = rests.filter(u => u.name.trim().toLowerCase() === name.trim().toLowerCase() 
                                        && u.email.trim().toLowerCase() === email.trim().toLowerCase()
                                        && u.password.trim().toLowerCase() === password.trim().toLowerCase())
                const isExist = rests.length
                if (isExist == 0) {
                    const restaurant = new Restaurant({name,email,password})
                    restaurant
                        .save()
                        .then((result) => {
                            console.log('Server: emmitting restaurant', result._id.toString());
                            socket.emit('restaurant', {result})
                        })
                        .catch((e) => console.log(e))
                } else {
                    socket.emit('failedToSignUp')
                }
            }).catch(e => console.log(e))
        }
    })

    socket.on('login', ({values,type}) => { 
        const {email,password} = values
        if (type == 'cook') {
            User
            .find()
            .then(users => {
              const result = users.filter(u => u.email.trim().toLowerCase() == email.trim().toLowerCase() 
                                          && u.password.trim().toLowerCase() == password.trim().toLowerCase())[0]
              if (result) {
                  console.log('Server: login');
                  console.log('Server: emmitting user', result._id.toString());
                  socket.emit('user', {result})
              } else {
                  socket.emit('failedToLogIn')
              }
            })
            .catch(e => console.log(e))
        } else if (type == 'recruiter') {
            Restaurant
          .find()
          .then(rests => {
            const result = rests.filter(u => u.email.trim().toLowerCase() == email.trim().toLowerCase() 
                                        && u.password.trim().toLowerCase() == password.trim().toLowerCase())[0]
            if (result) {
                console.log('Server: login');
                console.log('Server: emmitting restaurant', result._id.toString());
                socket.emit('restaurant', {result})
            } else {
                socket.emit('failedToLogIn')
            }
          })
          .catch(e => console.log(e))
        }
    })

    socket.on('post-step1', ({title,file}) => {
        console.log('Server: post-step1');
        const post = new Post({title,file})
        post
        .save()
        .then((result) => {
            const id = result.id
            console.log('Server: emmitting handledStep1');
            socket.emit('handledStep1', result)
        })
        .catch((e) => console.log(e))
    })

    socket.on('post-submit', (data) => {
        console.log('Server: post-submit');
        const titleIng = data.titleIng !== '' ? data.values_2.titleIng : 'Ingredients:'
        const titleInstr = data.titleInstr !== '' ? data.values_2.titleInstr : 'Instructions:'
        Post.findById(data.id)
            .then(post => {
                post.author = data.author
                post.category = data.category
                post.hashtags = data.hashtags.join('*')
                post.description = data.description 
                post.ingredients = {
                    titleIng: titleIng,
                    items: JSON.stringify(data.ings) 
                }
                post.instructions = {
                    titleInstr: titleInstr,
                    steps: JSON.stringify(data.steps) 
                }
                post
                    .save()
                    .then(post => {
                        console.log('Server: emmitting showPost', post._id.toString());
                        socket.emit('showPost', post)
                    })
                    .catch(e => console.log(e))
            }).catch(e => console.log(e))
    })

    socket.on('post-job', ({values,userId}) => {
        const {position,location,salary,from,fulltime,description} = values
        Restaurant
        .findById(userId.userId)
        .then((restaurant) => {
            //console.log(restaurant.name);
            const company = {
                name: restaurant.name,
                id: userId.userId
            }
            const job = new Job({position,company,location,salary,from,fulltime,description})
            job
            .save()
            .then((job) => {
                socket.emit('showJob', job)
            }).catch(e => console.log(e))
        }).catch(e => console.log(e))
    })

    socket.on('getJob', (id) => {
        Job
        .findById(id)
        .then((job) => {
            socket.emit('showJob', job)
        }).catch(e => console.log(e))
    })

    socket.on('post-access', (id) => {
        console.log('Server: post-access');
        Post.findById(id)
        .then(post => {
            console.log('Server: emmitting showPost', post);
            socket.emit('showPost', post)
        }).catch(e => console.log(e))
    })

    socket.on('get-author', (id) => {
        User.findById(id)
        .then(user => {
            console.log('Server: emmitting showUser', user);
            socket.emit('showUser', {user})
        }).catch(e => console.log(e))
    })

    socket.on('getPosts', (id) => {
        console.log('Server: getPosts');
        Post
        .find()
        .then((posts) => {
            const creations = posts.filter(p => p.author == id)
            console.log('Server: emmitting showPosts', creations.map(c => c._id.toString()));
            socket.emit('showMyPosts', creations)
        }).catch(e => console.log(e))
    })

    socket.on('getJobs', (id) => {
        console.log('Server: getJobs');
        Job
        .find()
        .then((result) => {
            const jobs = result.filter(j => j.company.id == id)
            console.log('Server: emmitting showJobs', jobs.map(j => j._id.toString()));
            socket.emit('showMyJobs', jobs)
        }).catch(e => console.log(e)) 
    })

    socket.on('getRecentJobs', () => {
        Job
        .find()
        .sort({date: -1})
        .then((result) => {
            const jobs = result.slice(0,20)
            socket.emit('showJobs', jobs)
        }).catch(e => console.log(e))
    })

    socket.on('getRestaurants', () => {
        Restaurant
        .find()
        .then((result) => {
            const restaurants = result.sort((a,b) => b.likes - a.likes).slice(0,10)
            socket.emit('showRestaurants',restaurants )
        })
    })

    socket.on('getPopularPosts', () => {
        Post
        .find()
        .then((posts) => {
            const best = posts.sort((a,b) => b.likes - a.likes).slice(0,8)
            socket.emit('showPopularPosts', best)
        })
    })

    socket.on('getByCategory', (category) => {
        Post
        .find()
        .then((result) => {
            const posts = result.filter(p => p.category && p.category.trim().toLowerCase() == category.trim().toLowerCase())
            socket.emit('showCategoryPosts', posts)
        })
    })

    socket.on('getPopularUsers', () => {
        User
        .find()
        .then((users) => {
            const best = users.sort((a,b) => b.likes - a.likes).slice(0,5)
            socket.emit('showPopularUsers', best)
        })
    })

    socket.on('searchRequest', ({searcher,request,search}) => {
        console.log(searcher);
        console.log(request);
        console.log(search);
        if (search == 'Post') {
            Post
            .find()
            .then((posts) => {
                //const result = posts.filter(p => p)

            }).catch(e => console.log(e))
        } else if (search == 'People') {

        } else if (search == 'Jobs') {

        } else if (search == 'Restaurants') {

        } else {

        } 
    })
 
    io.on('disconnect', () => {
        console.log('Disconnect');
    })
})

// io.on("connection", (socket) => {
//     socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });
//   });

server.listen(process.env.PORT || 4000, () => {
    console.log('Server is Running! :)');
})