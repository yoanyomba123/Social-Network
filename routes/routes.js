const mongoose = require('mongoose');

// bring in model class
let Article = require('../models/article');

module.exports = app => {

    // logged in or not
    app.get('*', function(request, response, next){
        response.locals.user = request.user || null;
        next();
    });

    // add an articles
    app.get('/article/add', function(request, response){
        response.render('add_article', {
            title:'Articles'
        })
    });

    // add submit post rout
    app.post('/article/add', function(request, response){
        request.checkBody('title', 'Title is required').notEmpty();
        request.checkBody('author', 'Author is required').notEmpty();
        request.checkBody('body', 'Body is required').notEmpty();

        let errors = request.validationErrors();
        if(errors){
            response.render('add_article',{
                title: 'Articles',
                errors: errors
            });
        }
        else{
            let article = new Article();
            article.title = request.body.title;
            article.author = request.body.author;
            article.body = request.body.body;
            article.save(function(error){
                if(error){
                    console.log(error);
                    return;
                }
                else{
                    request.flash('success', 'Article Added');
                    response.redirect('/');
                }
            });
        }
        
       
    });

    // get single article content
    app.get('/article/:id', function(request, response){
        Article.findById(request.params.id, function(error, article){
            response.render('article', {
                article: article
            });
        });
    });

    // edit and load edit form an article
    app.get('/article/edit/:id', function(request, response){
        Article.findById(request.params.id, function(error, article){
            response.render('edit_article', {
                title: 'Edit Article',
                article: article
            });
        });
    });

    // add submit update post rout
    app.post('/articles/edit/:id', function(request, response){
        let article = {};
        article.title = request.body.title;
        article.author = request.body.author;
        article.body = request.body.body;
        let query = {_id: request.params.id};
        Article.update(query, article,function(error){
            if(error){
                console.log(error);
                return;
            }
            else{
                request.flash('success', 'Article Updated');                
                response.redirect('/');
            }
        });
    });

    app.delete('/article/:id', function(request, response){
        let query = {_id: request.params.id};
        console.log(request.params.id);
        Article.remove(query, function(error){
            if(error){
                console.log(error);
            }
            response.send('Success');
        });
    });


};