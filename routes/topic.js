var express = require('express');
var router = express.Router();
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
const fs = require('fs');
var template = require('../lib/template.js');

router.get('/create', function(req, res){
    var title = 'WEB - create';
    var list = template.list(req.list);
    var html = template.HTML(title, list, `
      <form action="/topic/create" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    res.send(html);
  });
  
router.post('/create', function(req, res){
    
    /*
    var body = '';
    req.on('data', function(data){
        body = body + data;
    });
    req.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          res.redirect(`/page/${title}`);
          // res.writeHead(302, {Location: `/page/${title}`});
          // res.end();
        });
    });
    */
    console.log(req.list); // undefiend
    var post = req.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      res.redirect(`/topic/${title}`);
      // res.writeHead(302, {Location: `/page/${title}`});
      // res.end();
    });
  });
  
router.get('/update/:pageId', function(req, res){
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = req.params.pageId;
      var list = template.list(req.list);
      var html = template.HTML(title, list,
        `
        <form action="/topic/update/${title}" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `, '');
      res.send(html);
    });
  });
  
router.post('/update/:pageId', function(req, res){
    var post = req.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        res.redirect(`/topic/${title}`);
      });
    }); 
  });
  
router.post('/delete', function(req, res){
    var post = req.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
      res.redirect('/');
      // res.writeHead(302, {Location: `/`});
      // res.end();
    });
  });
  
router.get('/:pageId', function(req, res, next){
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      if(err){
        next(err);
      } else {
        var title = req.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
          allowedTags:['h1']
        });
        var list = template.list(req.list);
        var html = template.HTML(sanitizedTitle, list,
          `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
          ` <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
        );
        res.send(html);
      }
    });  
  });

  module.exports = router;