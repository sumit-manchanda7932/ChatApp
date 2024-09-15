

const express=require("express");
const morgan=require("morgan");

const rateLimit=require("express-rate-limit");

const helmet=require("helmet");

const mongosanitize=require("express-mongo-sanitize");

const bodyParser=require("body-parser");

const xss=require("xss");

const cors=require("cors");

const app=express();

const routes=require("./routes/index");

app.use(mongosanitize());

// app.use(xss());

app.use(cors({
    origin:"*",
    methods:["GET","PATCH","POST","DELETE","PUT"],
    credentials:true,
}));

app.use(express.json({limit:"10kb"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


const limiter=rateLimit({
    max:3000,
    windowMs:60*60*1000,
    message:"Too many request from this IP,Please try again in an hour"
})

app.use("/tawk",limiter);

app.use(express.urlencoded({
    extended:true,
}));

app.use(routes);


module.exports=app; 
