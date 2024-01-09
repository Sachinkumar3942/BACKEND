const express = require("express");
require("./files/config");
const cors = require("cors");
const user = require("./files/users");
const product = require("./files/Product");
const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm";
const app = express();

app.use(cors({origin:'*' ,
 methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
preflightContinue: false , 
optionsSuccessStatus: 204}));
app.use(express.json());

app.get("/", async(req,res)=> {
  res.setHeader('Access-Control-Allow-Origin', '*')  ;
  res.setHeader('Access-Controller-Allow-Methods','GET,POST,OPTIONS,PUT,PATCH,DELETE'); 
  res.setHeader('Access-Controller-Allow-Headers','X-Requested-With,content-type');  
  res.setHeader('Access-Control-Allow-Credentials', true) ;    
  res.send("Hello World ");
})

app.post("/", async (req, resp) => {
    try{
        let User = new user(req.body);
        User = await User.save();
        User = User.toObject();
        delete User.password;
        Jwt.sign({User},jwtKey,{expiresIn: '5h'},(err,token)=>{
            if(err){
                resp.
                header('Access-Control-Allow-Origin','*').
                json({ result: "Something went wrong, try again" });
            }
            else{
                resp.header('Access-Control-Allow-Origin','*').
                json({User,auth:token});
            }
        })
    } catch (error) {
        console.log("Error login "); 
        resp.status(500).
        header('Access-Control-Allow-Origin','https://main--monumental-lokum-1725ab.netlify.app/').
        send({message : "Error sending User"}) ; 
    } 
  
});

app.post("/add-product",verifyToken, async (req, resp) => {
  try {
    let User = new product(req.body);
    User = await User.save();
    resp.send(User);
  } catch (error) {
    console.log("Error adding product "); 
    resp.status(500).send({message : "Error sending User"}) ; 
  }
 
});

app.post("/login",async (req, resp) => {
  try{
    if (req.body.password && req.body.email) {
    let User = await user.findOne(req.body).select("password").select("name");
    if (User) {
      Jwt.sign({User},jwtKey,{expiresIn: '5h' },(err,token)=>{
        if(err){
          resp.send({ result: "No User Found" });
        }
        else{
          resp.send({User,auth: token});
        }        
      })
    } else {
      resp.send({ result: "No User Found" });
    }
  } else resp.send({ result: "Enter email and password " });
  }catch  (error)
  {
   console.log("Failed to login ") ;  
   resp.status(404).send({message : "No User found " })
  }
});

app.get("/product-list",verifyToken, async (req, resp) => {
  try{
    let User = await product.find();
    if (User.length > 0) {
      resp.send(User);
    } else {
      resp.send("Product not available");
    }
  }
  catch  (error)
  {
   console.log("Failed to get product list ") ;  
   resp.status(404).send({message : "No User found " })
  }
  
});

app.delete("/product/:id",verifyToken, async (req, resp) => {
  try 
  {
    let User = await product.deleteOne({ _id: req.params.id });
    resp.send(User);
  }
  catch (error)
  {
   console.log("Failed to delete User ") ;  
   resp.status(404).send({message : "No User found " })
  }

});

app.get("/product/:id",verifyToken, async (req, resp) => {
  try 
  {
    let User = await product.findOne({ _id: req.params.id });
    if (User) {
      resp.send(User);
    } else {
      resp.send("No Record Found");
    }
  }
  catch (error)
  {
   console.log("Failed to get product ") ;  
   resp.status(404).send({message : "No User found " })
  }

});

app.put("/product/:id",verifyToken, async (req, resp) => {
  try{
    let User = await product.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    resp.send(User);
  }
  catch (error)
  {
    console.log("Failed to update User ") ;
    resp.status(404).send({message : "No User found " })
  }
 
});

app.get("/search/:key",verifyToken, async (req, resp) => {
  try{
    let User = await product.find({
      $or: [
        { name: { $regex: req.params.key } },
        // {price:{$regex:req.params.key}},
        { brand: { $regex: req.params.key } },
        { category: { $regex: req.params.key } },
      ],
    });
    resp.send(User);
  }
  catch (error)
  {
   console.log("Failed to search User ") ; 
   resp.status(404).send({message : "No User found " })
  }

});


function verifyToken(req,resp,next){
  let token = req.headers['authorization'];
  if(token){
    token=token.split(' ')[1];
    Jwt.verify(token,jwtKey,(err,valid)=>{
      if(err){
        resp.status(401).send("Please enter a valid token.");
      }
      else{
        next();
      }
    })
  }
  else{
    resp.status(404).end("please add a token with header");
  }
}

app.listen(5000);
