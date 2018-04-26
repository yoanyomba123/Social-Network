const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
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
        
        User.findById({'_id':request.user._id}, function(error, user){
            if(error){
                console.log(error);
                return;
            }
            if(!user){
                return new Error("User Does Not Exist");
            } 
            post.user = request.user._id;
            post.body = request.body.body;

            user.posts.push(post._id);
            user.save();
            
            console.log("HEHEHEHEHEEH")
            console.log(user);
            console.log(user.posts)
            console.log("HEHEHEHEHEEH")

            post.save(function(error){
                if(error){
                    console.log(error);
                    return;
                }
                else{
                    request.flash('success', 'Post Added');
                    response.redirect('/myprofile');
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


