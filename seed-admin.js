require('dotenv').config();
const bcrypt=require('bcryptjs');
const prisma=require('../server/db');
(async()=>{
  const email=String(process.env.ADMIN_EMAIL||'').toLowerCase();
  const password=String(process.env.ADMIN_PASSWORD||'');
  if(!email||password.length<14){throw new Error('Définissez ADMIN_EMAIL et ADMIN_PASSWORD (14 caractères minimum) dans .env.');}
  const existing=await prisma.user.findUnique({where:{email}});
  if(existing){console.log('Administrateur déjà existant; aucune modification.');return;}
  const user=await prisma.user.create({data:{email,displayName:'Administrateur NZOLANI',passwordHash:await bcrypt.hash(password,12),role:'ADMIN'}});
  console.log(`Administrateur créé : ${user.email}`);
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>prisma.$disconnect());
