const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcryptjs');
const passport = require('passport');

module.exports = {
    addPost,
    processPost,
    deletePost,
    updatePost
}

// add post
function addPost(request, response){
    response.render('add_post', {
        title: 'Post'
    });
}

// add post - submittion
function processPost(request, response, next){
    request.checkBody('body', 'Body is required').notEmpty();
    let errors = request.validationErrors();
    if(errors){
        /*
        response.render('add_post',{
            title: 'Post',
            errors: errors
        });
        */
       console.log("error");
       console.log(error);
       return;
    }
    else{
        let post = new Post();
        console.log(request.user);
        User.findById({'_id':request.user._id}, function(user, error){
            if(error){
                console.log(error);
                return;
            }
            if(!user){
                return new Error("User Does Not Exist");
            } 
            post.user_id = request.user._id;
            post.body = request.body.body;
            post.posted = Date.now;
            user.posts.push(post);
            post.save(function(error){
                if(error){
                    console.log(error);
                    return;
                }
                else{
                    request.flash('success', 'Post Added');
                    response.redirect('/feed');
                }
            });

        });
    }
}

// delete a post
function deletePost(request, response){
    let query = {'_id': request.param.id};
    Post.remove(query, function(error, post){
        if(error){
            console.log(error);
            return;
        }
        response.send("success");
    });
}

// update post
function updatePost(request, response){
    let query = {'_id': request.params.id};
    let post = {};
    post.body = request.body.body;
    post.update = Date.now;
    post.user_id = request.user.user_id;
    Post.update(query, post, function(error, post){
        if(error){
            console.log(error);
            return;
        }
        else{
            request.flash('success', 'Article Updated');
            response.redirect('/home');
        }
    });
}


