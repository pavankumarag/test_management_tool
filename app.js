//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment')
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//mongoose.connect("mongodb://localhost:27017/naviQA", {useNewUrlParser: true});

mongoose.connect("mongodb+srv://pavan-admin:ag123@pavan-wtf4d.mongodb.net/naviQA?retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true })
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  userRole: Number
});
autoIncrement.initialize(mongoose.connection)
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'userId', startAt: 1 })

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const testcaseSchema = new mongoose.Schema({
  name: String,
  description: String,
  priority: String,
  category: String,
  subCategory: String,
  executionSteps: String,
  expectedResult: String,
  automated: String,
  result: String
})
testcaseSchema.plugin(autoIncrement.plugin, { model: 'Testcase', field: 'testcaseId', startAt: 1 })
const Testcase = new mongoose.model("Testcase", testcaseSchema);

app.post("/addtestcase", function(req, res){
  const testcase = new Testcase({
    name: req.body.test_name,
    description: req.body.test_desc,
    priority: req.body.priority,
    category: req.body.category,
    subCategory: req.body.sub_category,
    executionSteps: req.body.steps,
    expectedResult: req.body.expected_result,
    automated: req.body.automated,
    result:req.body.result
  })
  testcase.save(function(err, testcase){
    if (err) {
      console.log(err)
    }
    else {
      console.log("Testcase added " + testcase)
      res.redirect("/testcases")
    }
  })
})

/*app.post("/addtestcaseTable", function(req, res){
  const testcase = new Testcase({
      name : req.body.data[0].name,
      description : req.body.data[0].description,
      priority : req.body.data[0].priority,
      category : req.body.data[0].category,
      subCategory: req.body.data[0].subCategory,
      executionSteps : req.body.data[0].executionSteps,
      expectedResult : req.body.data[0].expectedResult,
      automated : req.body.data[0].automated
  })
  testcase.save(function(err, testcase){
    if (err) {
      console.log(err)
    }
    else {
      console.log("Testcase added " + testcase)
      res.status(200).send({"data": [testcase]})
    }
  })
})

app.put("/editTestcase", function(req, res){
  console.log(req.body.data)
  Testcase.findOne({testcaseId:req.body.data[0].testcaseId}, function(err, testcase){
    if (err){
      console.log("DB find error" + err)
    } else {
      testcase.name = req.body.data[0].name,
      testcase.description = req.body.data[0].description,
      testcase.priority = req.body.data[0].priority,
      testcase.category = req.body.data[0].category,
      testcase.executionSteps = req.body.data[0].executionSteps,
      testcase.expectedResult = req.body.data[0].expectedResult,
      testcase.automated = req.body.data[0].automated
      testcase.save(function(err, _testcase){
        if (err) {
          console.log(err)
        }
        else {
          console.log("Testcase updated ")
          res.status(200).send({"data": [testcase]});
        }
      })
    }
    
  })
})*/

app.post("/addtestcaseTable", function(req, res){
  var testcase_set = req.body.data
  testcase_set.forEach(function(tc){
      delete tc.testcaseId
  })
  console.log(testcase_set)
  Testcase.create(testcase_set, function(err, testcases){
    if (err) {
      console.log(err)
    }
    else {
      console.log("Testcase set added " + testcases)
      res.status(200).send({"data": testcases})
    }
  })
  
})


app.put("/editTestcase", function(req, res){
  console.log(req.query)
  req.body.data.forEach(function(tc){
    Testcase.findOne({testcaseId:tc.testcaseId}, function(err, testcase){
      if (err){
        console.log("DB find error" + err)
      } else {
        testcase.name = tc.name,
        testcase.description = tc.description,
        testcase.priority = tc.priority,
        testcase.category = tc.category,
        testcase.subCategory = tc.subCategory,
        testcase.executionSteps = tc.executionSteps,
        testcase.expectedResult = tc.expectedResult,
        testcase.automated = tc.automated,
        testcase.result = tc.result
        testcase.save(function(err, _testcase){
          if (err) {
            console.log(err)
          }
          else {
            console.log("Testcase updated ")
            //res.status(200).send({"data": [testcase]});
          }
        })
      }
      
    })
  })
  res.status(200).send({"data": req.body.data});
})

app.delete("/deleteTestcase", function(req, res){
  var a = String(req.url).split("&")
  var testcase = a.find(function(ele){
    if (ele.search("testcaseId")){
      return ele
    }
  })
  const _testcaseId = testcase[testcase.length -1]
  
  var deleteEntities = req.query.tId.split(",")
  deleteEntities.forEach(function(tc){
    Testcase.deleteOne({testcaseId:tc}, function(err){
      if (err){
        console.log("DB find error" + err)
      } 
    })
  })
  res.send({"status":200})
})

app.get("/", function(req, res){
  res.render("login_n");
});

app.get("/login", function(req, res){
  res.render("login_n");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/authenticated", function(req, res){
  if (req.isAuthenticated()){
    res.redirect("/testcases");
    //res.render("landing")
  } else {
    res.redirect("/login");
  }
});

app.get("/testcases", function(req, res){
  if (req.isAuthenticated()){
    console.log(req.user)
    Testcase.find(function(err, result){
      if (err) {
        console.log("Error finding testcases from DB")
      }
      else {
        //console.log({result})
        res.render("testcases", {testcases:result})
      }
    })
  } else {
    res.redirect("/login");
  }
})

app.get("/testcasesTable", function(req, res){
  if (req.isAuthenticated()){
    Testcase.find(function(err, result){
      if (err) {
        console.log("Error finding testcases from DB")
      }
      else {
        res.send(
          {
            "data" : result.reverse()
        })
      }
    })
  } else {
    res.redirect("/login");
  }
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username, userRole:req.body.role}, req.body.password, function(err, user){
    if (err) {
      res.send(err)
    } else {
      passport.authenticate("local")  (req, res, function(){
        res.redirect("/testcases");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/authenticated");
      });
    }
  });

});

app.get("/wip", function(req, res){
  if (req.isAuthenticated()){
    res.render("wip")
  } else {
    res.redirect("/login")
  }
})





app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000.");
});
