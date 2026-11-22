const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { z } = require('zod');
const prisma = require('./db');
const { authRequired, adminRequired } = require('./middleware');
const { catalog, steps } = require('./catalog');
const { answerWithAI } = require('./ai');

const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './storage/uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const maxBytes = Math.max(1, Number(process.env.MAX_UPLOAD_MB || 12)) * 1024 * 1024;
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage, limits: { fileSize: maxBytes },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Type de fichier non autorisé.'));
    cb(null, true);
  }
});
const registerSchema = z.object({
  email: z.string().email().max(190),
  password: z.string().min(12).max(128),
  displayName: z.string().min(2).max(100)
});
const lessonSchema = z.object({
  classLevel: z.enum(['CP1','CP2','CE1','CE2','CM1','CM2']),
  discipline: z.string().min(2).max(120),
  subDiscipline: z.string().min(2).max(120),
  theme: z.string().min(2).max(300),
  objectiveGeneral: z.string().max(2000).optional().nullable(),
  objectiveSpecific: z.string().max(2000).optional().nullable(),
  learningObjective: z.string().max(2000).optional().nullable(),
  prerequisites: z.string().max(4000).optional().nullable(),
  materials: z.string().max(4000).optional().nullable(),
  instructions: z.string().max(4000).optional().nullable(),
  steps: z.array(z.string().max(300)).min(1).max(20),
  status: z.enum(['DRAFT','VALIDATED']).optional()
});
async function audit(req, action, entityType, entityId, metadata={}) {
  await prisma.auditLog.create({data:{actorId:req.user?.id,action,entityType,entityId,metadata,ipAddress:req.ip}});
}

router.get('/health', (_req,res)=>res.json({ok:true,app:'NZOLANI V5',time:new Date().toISOString()}));
router.get('/catalog', (_req,res)=>res.json({classes:['CP1','CP2','CE1','CE2','CM1','CM2'],disciplines:catalog,steps}));

router.post('/auth/register', async (req,res,next)=>{
  try {
    const parsed=registerSchema.safeParse(req.body);
    if(!parsed.success)return res.status(400).json({error:'Données invalides.',details:parsed.error.flatten()});
    const count=await prisma.user.count();
    if(count===0)return res.status(403).json({error:'Provisionnez le premier administrateur via le script sécurisé.'});
    const exists=await prisma.user.findUnique({where:{email:parsed.data.email.toLowerCase()}});
    if(exists)return res.status(409).json({error:'Cette adresse est déjà utilisée.'});
    const user=await prisma.user.create({data:{email:parsed.data.email.toLowerCase(),displayName:parsed.data.displayName,passwordHash:await bcrypt.hash(parsed.data.password,12),role:'TEACHER'}});
    res.status(201).json({id:user.id,email:user.email,displayName:user.displayName,role:user.role});
  } catch(e){next(e)}
});
router.post('/auth/login', async (req,res,next)=>{
  try {
    const email=String(req.body.email||'').toLowerCase();
    const password=String(req.body.password||'');
    const user=await prisma.user.findUnique({where:{email}});
    if(!user||!user.active||!(await bcrypt.compare(password,user.passwordHash)))return res.status(401).json({error:'Identifiants incorrects.'});
    const token=jwt.sign({role:user.role,email:user.email},process.env.JWT_SECRET,{subject:user.id,expiresIn:process.env.JWT_EXPIRES_IN||'8h'});
    res.json({token,user:{id:user.id,email:user.email,displayName:user.displayName,role:user.role}});
  } catch(e){next(e)}
});
router.get('/me',authRequired,async(req,res)=>{
  const user=await prisma.user.findUnique({where:{id:req.user.id},select:{id:true,email:true,displayName:true,role:true,active:true}});
  res.json(user);
});

router.get('/lessons',authRequired,async(req,res)=>{
  const lessons=await prisma.lesson.findMany({where:{ownerId:req.user.id},orderBy:{updatedAt:'desc'},take:200});
  res.json(lessons);
});
router.post('/lessons',authRequired,async(req,res)=>{
  const parsed=lessonSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Fiche invalide.',details:parsed.error.flatten()});
  const d=parsed.data;
  const lesson=await prisma.lesson.create({data:{
    ownerId:req.user.id,classLevel:d.classLevel,discipline:d.discipline,subDiscipline:d.subDiscipline,theme:d.theme,
    objectiveGeneral:d.objectiveGeneral,objectiveSpecific:d.objectiveSpecific,learningObjective:d.learningObjective,
    prerequisites:d.prerequisites,materials:d.materials,instructions:d.instructions,steps:d.steps,status:d.status||'DRAFT'
  }});
  res.status(201).json(lesson);
});
router.put('/lessons/:id',authRequired,async(req,res)=>{
  const parsed=lessonSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Fiche invalide.'});
  const found=await prisma.lesson.findFirst({where:{id:req.params.id,ownerId:req.user.id}});
  if(!found)return res.status(404).json({error:'Fiche introuvable.'});
  const d=parsed.data;
  const lesson=await prisma.lesson.update({where:{id:found.id},data:{...d,subDiscipline:d.subDiscipline}});
  res.json(lesson);
});
router.delete('/lessons/:id',authRequired,async(req,res)=>{
  const found=await prisma.lesson.findFirst({where:{id:req.params.id,ownerId:req.user.id}});
  if(!found)return res.status(404).json({error:'Fiche introuvable.'});
  await prisma.lesson.delete({where:{id:found.id}});res.status(204).end();
});

router.post('/chat',authRequired,async(req,res)=>{
  const messages=Array.isArray(req.body.messages)?req.body.messages:[];
  if(!messages.length||messages.length>20)return res.status(400).json({error:'Conversation invalide.'});
  const safe=messages.filter(m=>['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,5000)}));
  try { res.json(await answerWithAI(safe)); }
  catch(e){res.status(502).json({mode:'ERROR',error:'Le service IA est temporairement indisponible.'});}
});

router.get('/documents',authRequired,async(req,res)=>{
  const docs=await prisma.pedagogicalDocument.findMany({where:{status:'PUBLISHED'},select:{id:true,title:true,issuer:true,publicationDate:true,classLevel:true,discipline:true,version:true,sourceReference:true,createdAt:true}});
  res.json(docs);
});
router.post('/admin/documents',authRequired,adminRequired,upload.single('file'),async(req,res,next)=>{
  try{
    if(!req.file)return res.status(400).json({error:'Fichier requis.'});
    const sha256=crypto.createHash('sha256').update(fs.readFileSync(req.file.path)).digest('hex');
    const doc=await prisma.pedagogicalDocument.create({data:{
      title:String(req.body.title||req.file.originalname).slice(0,250),
      issuer:req.body.issuer||null,sourceReference:req.body.sourceReference||null,
      publicationDate:req.body.publicationDate?new Date(req.body.publicationDate):null,
      classLevel:req.body.classLevel||null,discipline:req.body.discipline||null,version:req.body.version||null,
      storagePath:req.file.path,originalName:req.file.originalname,mimeType:req.file.mimetype,sizeBytes:req.file.size,
      sha256,uploadedById:req.user.id,notes:req.body.notes||null
    }});
    await audit(req,'DOCUMENT_UPLOAD','PedagogicalDocument',doc.id,{sha256});
    res.status(201).json({id:doc.id,status:doc.status,sha256});
  }catch(e){next(e)}
});
router.patch('/admin/documents/:id/status',authRequired,adminRequired,async(req,res)=>{
  const allowed=['VERIFIED','PUBLISHED','ARCHIVED','REJECTED'];
  if(!allowed.includes(req.body.status))return res.status(400).json({error:'Statut invalide.'});
  const doc=await prisma.pedagogicalDocument.findUnique({where:{id:req.params.id}});
  if(!doc)return res.status(404).json({error:'Document introuvable.'});
  if(req.body.status==='PUBLISHED'&&doc.status!=='VERIFIED')return res.status(409).json({error:'Un document doit être vérifié avant publication.'});
  const updated=await prisma.pedagogicalDocument.update({where:{id:doc.id},data:{status:req.body.status,verifiedById:req.body.status==='VERIFIED'?req.user.id:doc.verifiedById,verifiedAt:req.body.status==='VERIFIED'?new Date():doc.verifiedAt}});
  await audit(req,'DOCUMENT_STATUS_CHANGE','PedagogicalDocument',doc.id,{status:req.body.status});
  res.json({id:updated.id,status:updated.status});
});
router.get('/admin/documents',authRequired,adminRequired,async(_req,res)=>{
  const docs=await prisma.pedagogicalDocument.findMany({orderBy:{createdAt:'desc'},select:{id:true,title:true,issuer:true,originalName:true,classLevel:true,discipline:true,status:true,sha256:true,createdAt:true}});
  res.json(docs);
});
router.post('/admin/releases',authRequired,adminRequired,async(req,res)=>{
  const {version,title,notes,published=false}=req.body;
  if(!version||!title||!notes)return res.status(400).json({error:'Version, titre et notes requis.'});
  const release=await prisma.releaseNote.create({data:{version:String(version),title:String(title),notes:String(notes),published:Boolean(published)}});
  await audit(req,'RELEASE_CREATE','ReleaseNote',release.id,{version});
  res.status(201).json(release);
});
router.get('/releases',async(_req,res)=>{
  const releases=await prisma.releaseNote.findMany({where:{published:true},orderBy:{createdAt:'desc'},take:30});
  res.json(releases);
});
router.get('/admin/users',authRequired,adminRequired,async(_req,res)=>{
  const users=await prisma.user.findMany({select:{id:true,email:true,displayName:true,role:true,active:true,createdAt:true},orderBy:{createdAt:'desc'}});
  res.json(users);
});
router.patch('/admin/users/:id',authRequired,adminRequired,async(req,res)=>{
  const data={};
  if(typeof req.body.active==='boolean')data.active=req.body.active;
  if(['ADMIN','TEACHER'].includes(req.body.role))data.role=req.body.role;
  if(!Object.keys(data).length)return res.status(400).json({error:'Aucun changement valide.'});
  if(req.params.id===req.user.id&&data.active===false)return res.status(400).json({error:'Vous ne pouvez pas désactiver votre propre compte.'});
  const user=await prisma.user.update({where:{id:req.params.id},data,select:{id:true,email:true,role:true,active:true}});
  await audit(req,'USER_UPDATE','User',user.id,data);
  res.json(user);
});
router.get('/admin/audit',authRequired,adminRequired,async(_req,res)=>{
  const logs=await prisma.auditLog.findMany({orderBy:{createdAt:'desc'},take:200,include:{actor:{select:{email:true}}}});
  res.json(logs);
});

module.exports=router;
