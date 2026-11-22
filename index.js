require('dotenv').config();
const express=require('express');
const helmet=require('helmet');
const cors=require('cors');
const rateLimit=require('express-rate-limit');
const morgan=require('morgan');
const path=require('path');
const routes=require('./routes');

if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32){
  console.error('JWT_SECRET doit contenir au moins 32 caractères.');process.exit(1);
}
const app=express();
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false}));
app.use(cors({origin:process.env.APP_ORIGIN?process.env.APP_ORIGIN.split(','):false}));
app.use(express.json({limit:'1mb'}));
app.use(morgan('combined'));
app.use('/api',rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:'draft-7',legacyHeaders:false}));
app.use('/api',routes);
app.use(express.static(path.join(__dirname,'..','public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'..','public','index.html')));
app.use((err,_req,res,_next)=>{
  console.error(err);
  if(err.code==='LIMIT_FILE_SIZE')return res.status(413).json({error:'Fichier trop volumineux.'});
  if(err.message==='Type de fichier non autorisé.')return res.status(400).json({error:err.message});
  res.status(500).json({error:'Erreur interne.'});
});
const port=Number(process.env.PORT||3000);
app.listen(port,()=>console.log(`NZOLANI V5 API sur le port ${port}`));
