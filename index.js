const express = require('express')
const http = require('http')
const cors = require('cors');
const route = require('./route');
const { Server } = require('socket.io');
const mongoose = require('mongoose')
const siofu = require("socketio-file-upload");

const User = require('./models/users')
const Post = require('./models/posts')
const Restaurant = require('./models/restaurants')
const Job = require('./models/jobs')

const db = 'mongodb+srv://irkamor2002:Irkam1422@cluster0.3k9w5vy.mongodb.net/?retryWrites=true&w=majority'

mongoose
    .connect(db)
    .then((res) => console.log('Connected to DB'))
    .catch(e => console.log(e))

const app = express().use(cors({ origin: "*" }))
                     .use(route)
                     .use(siofu.router)

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://recepira-client.vercel.app/",
        methods: ["GET", "POST"],
        allowedHeaders: 'Content-Type, Authorization'
    }
})

/*
const corsOptions = {
    origin: ['https://expansion4-you-client.vercel.app', 'http://localhost:3001'],
    methods: 'GET, POST', 
    allowedHeaders: 'Content-Type, Authorization', 
  };
*/ 

io.on('connection', (socket) => {
    console.log('Connected!');

    const uploader = new siofu();
    //uploader.dir = "uploades";
    uploader.dir = './../client/src/images';
    uploader.listen(socket);

    uploader.on("saved", function(event){
        console.log('Success');
        event.file.clientDetail.name = event.file.name;
    });

    uploader.on("error", function(event){
        console.log("Error from uploader", event);
    });

    socket.on('click', () => {
        console.log('Server received click.')
    })

    socket.on('getUser', (id) => {
        User.findById(id)
        .then((user) => {
            socket.emit('showUser', user)
        }).catch((e) => console.log(e))
    })

    socket.on('getUserRe', (id) => {
        User.findById(id)
        .then((user) => {
            socket.emit('showUserRe', user)
        }).catch((e) => console.log(e))
    })

    socket.on('getUserAcc', (id) => {
        User.findById(id)
        .then((user) => {
            socket.emit('showUserAcc', user)
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
                post.hashtags = data.hashtags
                post.description = data.description 
                post.ingredients = {
                    titleIng: titleIng,
                    items: data.ings
                }
                post.instructions = {
                    titleInstr: titleInstr,
                    steps: data.steps
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
        const id = userId ? userId : '6465087702dbfa5b266e8ddf'  //!!!!!!
        Restaurant
        .findById(id)
        .then((restaurant) => {
            //console.log(restaurant.name); 
            const company = {
                name: restaurant.name,
                avatar: restaurant.avatar,
                id: id
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

    socket.on('setAuthor', ({userId,postId}) => {
        Promise.all([
            User.findById(userId),
            Post.findById(postId)
        ]).then(([user,post]) => {
            post.author_info = {
                name: user.name, 
                avatar: user.avatar
            }
            post.save().then((post) => {
                socket.emit('authorAdded', post)
            }).catch(e => console.log(e))
        }).catch(e => console.log(e))
    })

    socket.on('editRecipe', (data) => {
        Post.findById(data.id) 
        .then((post) => {
            post.description = data.description
            post.ingredients.items = data.ingredients
            post.instructions.steps = data.instructions

            post.save()
            .then((post) => socket.emit('recipeUpdated', post))
            .catch(e => console.log(e))
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

    socket.on('getPostsAcc', (id) => {
        Post
        .find()
        .then((posts) => {
            const creations = posts.filter(p => p.author == id)
            socket.emit('showMyPostsAcc', creations) 
        }).catch(e => console.log(e))
    })

    socket.on('getAllPosts', () => {
        Post.find()
        .then((posts) => socket.emit('showPosts', posts))
        .catch(e => console.log(e))
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

    socket.on('getAllJobs', () => {
        Job
        .find()
        .sort({date: -1}) 
        .then((result) => { 
            const jobs = result
            socket.emit('showAllJobs', jobs)
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
            const best = posts.sort((a,b) => b.likes.length - a.likes.length).slice(0,8)
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
        console.log(searcher,request,search)
        if (search == 'Posts') {
            Post
            .find()
            .then((posts) => {
                const result = posts.filter(p => p.title.trim().toLowerCase().includes(request.trim().toLowerCase()))
                console.log('emitting showPosts', result);
                socket.emit('showPosts', result)
            }).catch(e => console.log(e))
        } else if (search == 'People') {
            User
            .find()
            .then((users) => {
                const result = users.filter(u => u.name.trim().toLowerCase().includes(request.trim().toLowerCase()) || u.email.includes(request.trim().toLowerCase()))
                socket.emit('showPeople', result)
            }).catch(e => console.log(e))
        } else if (search == 'Jobs') {
            Job
            .find()
            .then((jobs) => {
                const result = searcher == 'location' ? 
                jobs.filter(j => j.location.trim().toLowerCase().includes(request.trim().toLowerCase())) :
                searcher == 'restaurant' ?
                jobs.filter(j => j.company.name.trim().toLowerCase().includes(request.trim().toLowerCase())) :
                jobs.filter(j => j.position.trim().toLowerCase().includes(request.trim().toLowerCase())) 
                socket.emit('showJobs', result)
            }).catch(e => console.log(e))
        } else if (search == 'Restaurants') { 
            Restaurant
            .find()
            .then((restaurants) => {
                const result = searcher == 'location' ?
                restaurants.filter(r => r.location.trim().toLowerCase().includes(request.trim().toLowerCase())) :
                restaurants.filter(r => r.name.trim().toLowerCase().includes(request.trim().toLowerCase())) 
                socket.emit('showRestaurants', result)
            })
        } else {

        } 
    })

    socket.on('like-post', ({postId,userId}) => {
        Post.findById(postId)
        .then((post) => {

            if (!post.likes.includes(userId)) {
                post.likes.push(userId)
            } else {
                post.likes.splice(post.likes.indexOf(userId), 1)
            }
            post.save()
            socket.emit('liked')

            Promise.all([
                User.findById(post.author),
                Restaurant.findById(post.author),
                User.findById(userId),
                Restaurant.findById(userId)
            ])
            .then(([user, restaurant, curr_u,curr_r]) => {
                const author = user ? user : restaurant
                const current = curr_u ? curr_u : curr_r
                author.likes = post.likes.length 
                author.notification.push({
                    id: userId,
                    name: current.name,
                    avatar: current.avatar,
                    action: `liked your post: ${post.name}`
                })
                author.save() 
            }).catch(e => console.log(e))

        }).catch(e => console.log(e))
    })

    socket.on('addResume', ({description,location,experience,education,languages,awards,userId}) => {
        User.findById(userId)
        .then((user) => {
            user.resume = {
                description: description,
                location: location,
                experience: experience,
                education: education,
                languages: languages,
                awards: awards
                }
            user.save()
            .then((user) => {
                socket.emit('resumeAdded')
            })
            .catch(e => console.log(e)) 
        }).catch(e => console.log(e)) 
    })

    socket.on('jobApply', ({values,userId,jobId}) => {
        Job
        .findById(jobId)
        .then((job) => {
            job.applicants.push({
                name: values.name,
                cv:  values.cv,
                coverletter:  `<pre>${values.coverletter}</pre>`,
                id:  userId,
            })
            job
            .save()
            .then(() => {
                console.log(job)
                socket.emit('applied')
            })
            .catch(e => console.log(e)) 
        }).catch(e => console.log(e)) 
    })

    socket.on('checkApplications', (userId) => {
        Job
        .find()
        .then((jobs) => {
            const result = jobs.filter(j => j.applicants.filter(ap => ap.id == userId).length > 0)
            const jobIds = result.map(j => j._id.toString())
            socket.emit('showApplications', jobIds) 
        })
    })

    socket.on('getApplicants', (applicants) => {
        User
        .find()
        .then((result) => {
            const step_1 = result.filter(u => applicants.map(a => a.id).includes(u._id.toString()))
            const users = step_1.map(u => {
                const applicant = applicants.filter(a => a.id == u._id.toString())[0]
                return {
                    user: u,
                    cv: applicant.cv,
                    coverletter: applicant.coverletter
                }
            })
            socket.emit('showApplicants', users)
        }).catch(e => console.log(e))
    })

    socket.on('followUser', ({currentId, toFollowId}) => {
        Promise.all([
            User.findById(toFollowId),
            User.findById(currentId),
            Restaurant.findById(currentId)
        ])
        .then(([user,cUser,rest]) => {
            const current = cUser ? cUser : rest
            user.followers.push(currentId)
            user.notification.push({
                id: currentId,
                name: current.name,
                avatar: current.avatar,
                action: 'started following you'
            })
            user.save() 
            .then((user) => {
                console.log(user.followers)
                socket.emit('following')
            })
            .catch(e => console.log(e))

            current.following.push(toFollowId)
            current.save()
            .then((current) => {
                console.log(current.following)
            }).catch(e => console.log(e))
        })
    })

    socket.on('getPostsFromFollowing', (id) => {
        Promise.all([
            Post.find().sort({date: -1}),
            User.findById(id)
        ])
        .then(([result,user]) => {
            const posts = result.filter(p => user.following.includes(p.author)).slice(0,21)
            socket.emit('showPostsFromFollowing', posts)
        }).catch(e => console.log(e))
    })

    socket.on('getMyApplications', (id) => {
        Job.find()
        .then((result) => {
            const jobs = result.filter(j => j.applicants.filter(app => app.id == id).length)
            socket.emit('showApplications', jobs)
        }).catch(e => console.log(e))
    })

    socket.on('getFreshPosts', () => {
        Post
        .find()
        .sort({date: -1})
        .then((result) => {
            const posts = result.slice(0,21)
            socket.emit('showFreshPosts', posts)
        }).catch(e => console.log(e))
    })

    socket.on('createChat', ({userId,chatId}) => {
        console.log('userId',userId,'; chatId',chatId) 
        Promise.all([
            User.find(),
            Restaurant.find()
        ])
        .then(([users,restaurants]) => {
            const u1 = users.filter(u => u._id.toString() == userId)[0]
            const me = u1 ? u1 : restaurants.filter(u => u._id.toString() == userId)[0]
            const u2 = users.filter(u => u._id.toString() == chatId)[0]
            const user = u2 ? u2 : restaurants.filter(u => u._id.toString() == chatId)[0]
            const chat = {
                room: Date.now(),
                users: [
                    {name:me.name, id:userId, avatar:me.avatar},
                    {name:user.name, id:chatId, avatar:user.avatar}
                ],
                messages: []
            }
            me.chats.push(chat)
            user.chats.push(chat)
            
            socket.join(chat.room)
            socket.emit('chatJoined', chat)

            me.save().then((me) => console.log(me))
            user.save().then((user) => console.log(user))

        }).catch(e => console.log(e)) 
    })

    socket.on('joinChat', ({chat,userId}) => {

        //console.log(chat,userId) 
        socket.join(chat.room)

        socket.emit('chatJoined', chat)

        Promise.all([ 
            User.findById(userId),
            Restaurant.findById(userId)
        ])
        .then(([user,restaurant]) => {
            const result = user ? user : restaurant
            const read = result.messages.filter(m => m.room == chat.room)[0]
            console.log('messages:',result.messages)
            console.log('read:',read)
            result.messages.splice(read,1)
            result.save()
        }).catch(e => console.log(e))
    })

    socket.on('sendMessage', ({msg,chat}) => {
        Promise.all([
            User.find(),
            Restaurant.find()
        ])
        .then(([res_u,res_r]) => {
            const users = res_u.filter(u => chat.users.map(u => u.id).includes(u._id.toString()))
            const restaurants = res_r.filter(u => chat.users.map(u => u.id).includes(u._id.toString()))
            const result = users.concat(restaurants)

            const receiver = result.filter(u => u._id.toString() !== msg.from)[0]
            const unread = receiver.messages.length ? receiver.messages.filter(m => m.room == chat.room)[0] : null
            unread ? receiver.messages.filter(m => m.room == chat.room)[0].unread += 1 
            : receiver.messages.push({room: chat.room, unread: 1})
            //receiver.save().then((user) => {}).catch(e => console.log(e))

            result.forEach(user => {
                user.chats.filter(ch => ch.room == chat.room)[0].messages.push(msg)
                user.save().then((user) => {}).catch(e => console.log(e))
            })

            io.to(chat.room).emit('message', msg) 
        }).catch(e => console.log(e))
    }) 

    socket.on('clearNotifications', (userId) => {
        User.findById(userId)
        .then((user) => {
            user.notification = []
            user.save()
        }).catch(e => console.log(e))
    })

    socket.on("changeAvatar", ({eFile, userId}) => {
        console.log('file', eFile)
        console.log('userId')    

        Promise.all([
            User.findById(userId),
            Restaurant.findById(userId)
        ])
        .then(([user,restaurant]) => {
            const current = user ? user : restaurant
            console.log('user found:', current.name)
            current.avatar = eFile
            current.save()
            .then((current) => socket.emit('avatarUpdated', current))
            .catch(e => console.log(e))
        }).catch(e => console.log(e))
    });
  
    io.on('disconnect', () => { 
        console.log('Disconnect');
    })
})

 
server.listen(process.env.PORT || 4000, () => {
    console.log('Server is Running! :)');
})