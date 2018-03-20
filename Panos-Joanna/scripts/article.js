'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// It uses a this on the third line to pull the publishedOn from the article and modify it to be how long ago it was published.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // This is a ternary operator. It looks to see whether the article has a published on property or if it is still a draft. If it is a draft then publishStatus=false, if there is one then publishStatus=true. The question mark represents where the returns begin and the colon seperates the true response on the left and the false response on the right.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// This function is called here inside fetchAll. rawData representes the presence of data inside the local storage. This allows the computer to load from JSON if the local storage object doesn't exist.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))
  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
  console.log(Article.all);
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.rawData) {
    console.log('if');
    let articleData=JSON.parse(localStorage.getItem('rawData'));  
    Article.loadAll(articleData);
    articleView.initIndexPage();
  } else {
    console.log('else');
    //It has to get the data from JSON, then set it to local storage so it slowly fills in the empty parts, going from JSON to localstorage to JS to DOM.
    $.getJSON('data/hackerIpsum.json').then(
      function(data){
        localStorage.setItem('rawData',JSON.stringify(data));
        Article.loadAll(data);
        articleView.initIndexPage();},
      function(err){
        console.log(err);
      });
  }
}