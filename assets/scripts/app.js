angular.module("er",["ngRoute","ngSanitize","angularMoment","er.controllers","er.services","er.directives","satellizer"]).config(["$locationProvider","$routeProvider","$authProvider",function(e,t,r){e.hashPrefix("!"),t.when("/start",{templateUrl:"assets/views/landing.htm"}).when("/",{templateUrl:"assets/views/home.htm"}).when("/my",{templateUrl:"assets/views/profile.htm"}),r.facebook({clientId:685381251615066})}]).run(["$rootScope","$templateCache",function(e,t){t.removeAll()}]),angular.module("er.controllers",[]).controller("startController",["$scope","$auth","$location",function(e,t,r){e.authenticate=function(e){t.authenticate(e).then(function(e){r.path("/")})["catch"](function(e){alert("Unable to authenticate")})}}]).controller("homeController",["$scope","$timeout","categoriesDropdown","countriesDropdown","dropdowns","identityService","feedService",function(e,t,r,a,i,o,n){e.cats=r,e.countries=a,e.r_tags=["Tag 1","Tag 2","Tag 3","Tag 4","Tag 5"],e.r_people=["Guy 1","Guy 2","Guy 3","Guy 4","Guy 5","Guy 6","Guy 7"],e.r_categories=["Category 1","Category 2","Category 3","Category 4"],o.then(function(t){e.user=t,e.feedLoading=!0,e.feed=[],n.then(function(t){e.feed=t,e.feedLoading=!1,e.$apply()})})}]).controller("profileController",["$scope","identityService","feedService",function(e,t,r){e.wallpaperStyle={},t.then(function(t){e.user=t,e.user.wallpaper&&(e.wallpaperStyle={"background-image":"url("+t.wallpaper+")}"}),e.feedLoading=!0,e.feed=[],r.then(function(t){e.feed=t,e.feedLoading=!1,e.$apply()})})}]),angular.module("er.directives",[]).directive("avatar",function(){return{restrict:"E",templateUrl:"assets/views/directives/avatar.htm",scope:{image:"@",color:"@",number:"@"}}}).directive("post",function(){return{restrict:"E",templateUrl:"assets/views/directives/post.htm",scope:{post:"="},link:function(e,t,r){e.user=e.$parent.user}}}).directive("question",function(){return{restrict:"E",templateUrl:"assets/views/directives/question.htm",scope:{question:"="}}}).directive("familiarexpert",function(){return{restrict:"E",templateUrl:"assets/views/directives/familiar-expert.htm",scope:{user:"="}}}).directive("newquestions",["$timeout",function(e){return{restrict:"E",templateUrl:"assets/views/directives/new-questions.htm",scope:{user:"="},link:function(e,t,r){e.questions=e.user.questions}}}]).directive("familiarexperts",["$timeout","familiarExpertsService",function(e,t){return{restrict:"E",templateUrl:"assets/views/directives/familiar-experts.htm",link:function(e,r,a){e.users=[],e.familiarExpertsLoading=!0,t.then(function(t){e.users=t,e.familiarExpertsLoading=!1,e.$apply()})}}}]).directive("topbar",function(){return{restrict:"E",templateUrl:"assets/views/directives/topbar.htm",scope:{user:"="}}}).directive("filters",["dropdowns",function(e){return{restrict:"E",templateUrl:"assets/views/directives/filters.htm",link:function(t,r,a){e()}}}]).directive("bigratedavatar",function(){return{restrict:"E",templateUrl:"assets/views/directives/big-rated-avatar.htm",scope:{user:"="},link:function(e,t,r){var a=angular.element(t).find("canvas")[0],i=a.getContext("2d"),o=angular.element(t)[0].children[0].offsetWidth,n=angular.element(t)[0].children[0].offsetHeight;angular.element(t).find("canvas").attr("width",o),angular.element(t).find("canvas").attr("height",n);var s=4,c=e.user.xp/100*2+1.5;i.lineWidth=s,i.strokeStyle="#43abe7",i.beginPath(),i.arc(o/2,n/2,o/2-s/2,1.5*Math.PI,c*Math.PI,!1),i.stroke()}}}).directive("autosuggest",function(){return{restrict:"A",templateUrl:"assets/views/directives/autosuggest.htm",scope:{suggestions:"="}}}),angular.module("er.services",[]).factory("identityService",["$timeout","$http",function(e,t){return new Promise(function(t,r){e(function(){var e={name:"Jack Daniels",position:"Director",avatar:"http://i.imgur.com/wq43v5T.jpg",rating:1,color:"bronze",wallpaper:"https://metrouk2.files.wordpress.com/2015/04/mm1-e1429271504595.png",xp:72,likes:4223,dislikes:23,reactions:1200,following:23200,followers:43002,likes_percentage:45,intro:"Lorem ipsum dolor sit amet, neglegentur vituperatoribus cum ei. Facete dolorum aliquando duo ne, pro an delenit praesentea perpetua adipiscing eos, civibus.",experience:"Lorem ipsum dolor sit amet, neglegentur vituperatoribus cum ei.",certificates:[{title:"Lorem Ipsum certificate"},{title:"Dolor certificate"}],downloads:[{title:"DESIGN.PSD"},{title:"PROTOTYPE.PDF"}],address:{email:"test@example.com",phone:"+1 234 567 89 00",skype:"test.example",linkedin:"linked.in",fb:"fb.name"},photos:[{url:"http://statici.behindthevoiceactors.com/behindthevoiceactors/_img/actors/danny-devito-19.9.jpg"},{url:"https://www.picsofcelebrities.com/celebrity/danny-devito/pictures/large/danny-devito-family.jpg"},{url:"http://vignette2.wikia.nocookie.net/godfather-fanon/images/a/aa/Tommy_DeVito.jpg/revision/latest?cb=20121121213421"},{url:"http://img2.rnkr-static.com/list_img_v2/2752/102752/870/danny-devito-movies-and-films-and-filmography-u2.jpg"},{url:"https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTkkc5M14e2-ePKz8nRrlUEAm64QmscRx2MneSFew1M2uL45CpW"},{url:"https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSE78J23sFfj0hRZcFc_iZ8wgXKbSNoazvfLSydHE-FP7dVunyo"},{url:"https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQRyoFyo7FBvCUFlEY8lIRRHREIBmXmXGxNt7-lEbRAQX7s27qAPw"},{url:"http://www.mcmbuzz.com/wp-content/uploads/2012/07/Danny-DeVito-at-the-London-MCM-Expo-3.jpg"},{url:"http://img.mypopulars.com/images/danny-devito/danny-devito_18.jpg"},{url:"http://www.filmreference.com/images/sjff_03_img1053.jpg"},{url:"http://i.dailymail.co.uk/i/pix/2015/01/19/24D7DB8200000578-0-image-a-1_1421687572450.jpg"},{url:"http://images.onionstatic.com/starwipe/6670/original/780.jpg"},{url:"https://s-media-cache-ak0.pinimg.com/236x/38/13/88/381388169d3c32162073fa96876d07e4.jpg"}],questions:[{author:{name:"Alla Pugacheva",avatar:"http://ua-reporter.com/sites/default/files/pug_zzz.jpg",rating:1,color:"bronze",role:"Visitor",country:"Russia"},text:"Lorem ipsum dolor sit amet?",likes:"3"}]},r=[];if(e.randomPhotos=[],e.photos.length<=8){e.randomPhotos=e.photos;for(var a=e.randomPhotos.length;9>a;a++)e.randomPhotos.push({url:""})}else for(var a=0;8>a;){var i=Math.floor(Math.random()*e.photos.length);-1===r.indexOf(i)&&(e.randomPhotos.push(e.photos[i]),r.push(i),a++)}e.likes=numeral(e.likes).format("0a").toUpperCase(),e.dislikes=numeral(e.dislikes).format("0a").toUpperCase(),e.reactions=numeral(e.reactions).format("0a").toUpperCase(),e.following=numeral(e.following).format("0a").toUpperCase(),e.followers=numeral(e.followers).format("0a").toUpperCase(),t(e)},300)})}]).factory("feedService",["$timeout","$sce","parseTextService",function(e,t,r){return new Promise(function(a,i){var o=[{id:1,author:{name:"Nicholas Cage",avatar:"https://s.aolcdn.com/hss/storage/midas/627f1d890718ff2c58318a280145a153/203216448/nicholas-cage-con-air.jpg",rating:1,color:"gold",position:"Director",country:"United States"},createdAt:new Date(Date.now()-1e3*Math.round(1e3*Math.random())),text:"@SomeGuy Lorem ipsum dolor sit amet, neglegentur vituperatoribus cum ei. Facete dolorum aliquando duo ne, pro an delenit praesentea perpetua adipisc eos, civibus.",image:"https://s.aolcdn.com/hss/storage/midas/627f1d890718ff2c58318a280145a153/203216448/nicholas-cage-con-air.jpg",ratings:{expert:{likes:12432,dislikes:4230,shares:1320},journalist:{likes:12432,dislikes:4230,shares:1320},visitor:{likes:12432,dislikes:4230,shares:1320}},comments:[{id:2,author:{name:"Nicholas Cage",avatar:"https://s.aolcdn.com/hss/storage/midas/627f1d890718ff2c58318a280145a153/203216448/nicholas-cage-con-air.jpg",rating:2,color:"silver",position:"Director",country:"United States"},createdAt:new Date(Date.now()-1e3*Math.round(1e3*Math.random())),text:"Lorem ipsum dolor sit amet, neglegentur vituperatoribus cum ei. Facete dolorum aliquando! #DieHard",likes:12,dislikes:1}]},{id:2,author:{name:"Nicholas Cage",avatar:"https://s.aolcdn.com/hss/storage/midas/627f1d890718ff2c58318a280145a153/203216448/nicholas-cage-con-air.jpg",rating:1,color:"gold",position:"Director",country:"United States"},createdAt:new Date(Date.now()-1e3*Math.round(1e3*Math.random())),text:"Lorem ipsum dolor sit amet, neglegentur vituperatoribus cum ei. Facete dolorum aliquando duo ne, pro an delenit praesentea perpetua adipisc eos, civibus.",image:"https://s.aolcdn.com/hss/storage/midas/627f1d890718ff2c58318a280145a153/203216448/nicholas-cage-con-air.jpg",ratings:{expert:{likes:12432,dislikes:4230,shares:1320},journalist:{likes:12432,dislikes:4230,shares:1320},visitor:{likes:12432,dislikes:4230,shares:1320}}},{id:3,author:{name:"John Lennon",avatar:"https://s.aolcdn.com/hss/storage/midas/627f1d890718ff2c58318a280145a153/203216448/nicholas-cage-con-air.jpg",rating:1,color:"silver",position:"Singer",country:"United Kingdom"},createdAt:new Date(Date.now()-1e3*Math.round(1e3*Math.random())),text:"Lorem ipsum dolor sit amet, neglegentur vituperatoribus cum ei. Facete dolorum aliquando duo ne, pro an delenit praesentea perpetua adipisc eos, civibus.",ratings:{expert:{likes:12432,dislikes:4230,shares:1320},journalist:{likes:12432,dislikes:4230,shares:1320},visitor:{likes:12432,dislikes:4230,shares:1320}}}];for(var n in o){var s=o[n];if(s.ratings.expert.likes=numeral(s.ratings.expert.likes).format("0a").toUpperCase(),s.ratings.expert.dislikes=numeral(s.ratings.expert.dislikes).format("0a").toUpperCase(),s.ratings.expert.shares=numeral(s.ratings.expert.shares).format("0a").toUpperCase(),s.ratings.journalist.likes=numeral(s.ratings.journalist.likes).format("0a").toUpperCase(),s.ratings.journalist.dislikes=numeral(s.ratings.journalist.dislikes).format("0a").toUpperCase(),s.ratings.journalist.shares=numeral(s.ratings.journalist.shares).format("0a").toUpperCase(),s.ratings.visitor.likes=numeral(s.ratings.visitor.likes).format("0a").toUpperCase(),s.ratings.visitor.dislikes=numeral(s.ratings.visitor.dislikes).format("0a").toUpperCase(),s.ratings.visitor.shares=numeral(s.ratings.visitor.shares).format("0a").toUpperCase(),s.text=t.trustAsHtml(r(s.text)),s.comments)for(var c in s.comments){var l=s.comments[c];l.text=t.trustAsHtml(r(l.text)),s.comments[c]=l}o[n]=s}e(function(){a(o)},500)})}]).factory("familiarExpertsService",["$timeout",function(e){return new Promise(function(t,r){var a=[{id:1,name:"Keanu Reeves",role:"Expert",image:"https://s.aolcdn.com/hss/storage/midas/627f1d890718ff2c58318a280145a153/203216448/nicholas-cage-con-air.jpg",color:"bronze",rating:2,likes_percentage:70},{id:2,name:"Keanu Reeves",role:"Expert",image:"https://s.aolcdn.com/hss/storage/midas/627f1d890718ff2c58318a280145a153/203216448/nicholas-cage-con-air.jpg",color:"bronze",rating:2,likes_percentage:70},{id:3,name:"Keanu Reeves",role:"Expert",image:"https://s.aolcdn.com/hss/storage/midas/627f1d890718ff2c58318a280145a153/203216448/nicholas-cage-con-air.jpg",color:"bronze",rating:2,likes_percentage:70}];e(function(){t(a)},2e3)})}]).factory("dropdowns",function(){return function(){var e=angular.element(document.querySelectorAll(".menu-buttons.dropdown")),t=angular.element(document.querySelectorAll(".dropdown-list")),r=angular.element(document.body);r.on("click",function(){t.removeClass("active")}),e.on("click",function(e){e.stopImmediatePropagation();var t=angular.element(this).attr("dropdown-id");angular.element(document.querySelector('.dropdown-list[dropdown-id="'+t+'"]')).toggleClass("active")})}}).factory("categoriesDropdown",function(){var e=(angular.element(document.querySelector(".menu-buttons.dropdown[dropdown-id=categories]")),angular.element(document.querySelector(".dropdown-list[dropdown-id=categories]")));e.on("click",function(e){e.stopImmediatePropagation()});var t={};t.categories=[{id:1,title:"World News",count:353478392},{id:2,title:"Canada News",count:12478392},{id:3,title:"Buzz News",count:4478392},{id:4,title:"Science",count:2478392},{id:5,title:"Business",count:532952},{id:6,title:"Health",count:422321},{id:7,title:"Technology",count:352210},{id:8,title:"Sport",count:24990},{id:9,title:"Entertainment",count:1224}],t.chosenCategory=t.categories[1],t.activeCategoryClass=function(e){return{active:e.id===t.chosenCategory.id}},t.setActiveCategory=function(r){t.chosenCategory=r,e.removeClass("active")};for(var r in t.categories)t.categories[r].countShort=numeral(t.categories[r].count).format("0a").toUpperCase();return t}).factory("countriesDropdown",function(){var e=(angular.element(document.querySelector(".menu-buttons.dropdown[dropdown-id=countries]")),angular.element(document.querySelector(".dropdown-list[dropdown-id=countries]")));e.on("click",function(e){e.stopImmediatePropagation()});var t={};return t.countries=[{id:1,title:"North America",sub:[{id:2,title:"United States"},{id:3,title:"Canada"},{id:4,title:"Mexico"}]},{id:5,title:"Central & South America",sub:[{id:6,title:"Brazil"},{id:7,title:"Chile"},{id:8,title:"Argentina"}]}],t.chosenCountry=t.countries[0].sub[0],t.activeRegionClass=function(e){var r=!1;for(var a in e.sub)e.sub[a].id===t.chosenCountry.id&&(r=!0);return{active:r}},t.activeCountryClass=function(e){return{active:t.chosenCountry.id===e.id}},t.setActiveCountry=function(r){t.chosenCountry=r,e.removeClass("active")},t}).factory("parseTextService",function(){return function(e,t){return t||(t={tags:[],people:[],cats:[]}),e=e.replace(/#([a-z0-9]+)/gi,'<a href="#!/tag/$1" class="'+t.tags.join(" ")+'">#$1</a>'),e=e.replace(/@([a-z0-9]+)/gi,'<a href="#!/people/$1" class="'+t.people.join(" ")+'">@$1</a>'),e=e.replace(/\$([a-z0-9]+)/gi,'<a href="#!/category/$1" class="'+t.cats.join(" ")+'">$$1</a>')}});
//# sourceMappingURL=app.js.map