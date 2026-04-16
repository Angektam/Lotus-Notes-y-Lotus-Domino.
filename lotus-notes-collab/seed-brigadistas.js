require("dotenv").config();
const { sequelize } = require("./src/config/database");
const User = require("./src/models/User");
const Report = require("./src/models/Report");

const COMUNIDADES = [
  { nombre: "Comunidad San Juan", zona: "Norte", supervisor: { username: "sup.sanjuan", email: "sup.sanjuan@brigada.com", fullName: "Roberto Fuentes", password: "admin123" }, brigadistas: ["Carlos Mendoza","Ana Garcia","Luis Hernandez","Maria Lopez","Jose Martinez","Laura Rodriguez","Miguel Perez","Sofia Gonzalez","Diego Torres"] },
  { nombre: "Comunidad Santa Rosa", zona: "Sur", supervisor: { username: "sup.santarosa", email: "sup.santarosa@brigada.com", fullName: "Patricia Vega", password: "admin123" }, brigadistas: ["Valentina Ramirez","Andres Flores","Camila Diaz","Fernando Morales","Isabella Vargas","Ricardo Jimenez","Daniela Castro","Eduardo Romero","Natalia Ortiz"] },
  { nombre: "Comunidad El Progreso", zona: "Este", supervisor: { username: "sup.progreso", email: "sup.progreso@brigada.com", fullName: "Marco Ibanez", password: "admin123" }, brigadistas: ["Alejandro Ruiz","Paola Gutierrez","Sebastian Reyes","Gabriela Sanchez","Mateo Alvarez","Valeria Nunez","Pablo Herrera","Lucia Medina","Javier Aguilar"] },
  { nombre: "Comunidad La Esperanza", zona: "Oeste", supervisor: { username: "sup.esperanza", email: "sup.esperanza@brigada.com", fullName: "Carmen Rios", password: "admin123" }, brigadistas: ["Mariana Vega","Nicolas Ramos","Fernanda Cruz","Emilio Moreno","Adriana Suarez","Rodrigo Delgado","Claudia Fuentes","Tomas Paredes","Veronica Ibanez"] },
  { nombre: "Comunidad Centro Historico", zona: "Centro", supervisor: { username: "sup.centro", email: "sup.centro@brigada.com", fullName: "Hector Salinas", password: "admin123" }, brigadistas: ["Arturo Cabrera","Monica Espinoza","Hector Navarro","Patricia Rios","Ernesto Salinas","Beatriz Pena","Guillermo Lara","Silvia Campos","Raul Contreras"] }
];
const EQUIPOS = ["Alpha","Beta","Gamma"];
const ESTADOS = ["ASIGNADO","EN_ELABORACION","ENVIADO","APROBADO","OBSERVADO"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
function slug(n){return n.toLowerCase().replace(/\s+/g,".");}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function rndDate(ago){return new Date(Date.now()-Math.random()*ago*86400000);}
async function seed(){
  try{
    console.log("Conectando...");
    await sequelize.authenticate();
    console.log("OK\n");
    let tb=0,tr=0;
    for(const com of COMUNIDADES){
      console.log("--- "+com.nombre+" ---");
      let sup=await User.findOne({where:{username:com.supervisor.username}});
      if(!sup){
        sup=await User.create({username:com.supervisor.username,email:com.supervisor.email,password:com.supervisor.password,fullName:com.supervisor.fullName,role:"supervisor",department:com.nombre,supervisorProfile:{managedZones:[com.zona],department:com.nombre,community:com.nombre}});
        console.log("  Supervisor creado: "+sup.fullName);
      } else {
        await sup.update({supervisorProfile:{...sup.supervisorProfile,community:com.nombre}});
        console.log("  Supervisor actualizado: "+sup.fullName);
      }
      for(let i=0;i<com.brigadistas.length;i++){
        const nombre=com.brigadistas[i];
        const username=slug(nombre)+"."+com.zona.toLowerCase();
        const email=slug(nombre)+"."+com.zona.toLowerCase()+"@brigada.com";
        let b=await User.findOne({where:{email}});
        if(!b){
          b=await User.create({username,email,password:"brigada123",fullName:nombre,role:"brigadista",department:com.nombre,status:Math.random()>0.1?"active":"away",brigadistaProfile:{zone:com.zona,team:rnd(EQUIPOS),community:com.nombre,supervisorId:sup.id,startDate:rndDate(180)}});
          tb++;
        } else {
          await b.update({brigadistaProfile:{...b.brigadistaProfile,community:com.nombre,supervisorId:sup.id}});
        }
        const nr=2+Math.floor(Math.random()*2);
        for(let r=0;r<nr;r++){
          const mes=rnd(MESES);const estado=rnd(ESTADOS);const asig=rndDate(90);const vence=new Date(asig.getTime()+30*86400000);
          await Report.create({assignedTo:b.id,assignedBy:sup.id,assignedDate:asig,dueDate:vence,title:"Informe "+mes+" 2025 - "+com.nombre,description:"Reporte mensual en "+com.nombre,periodStart:asig,periodEnd:vence,status:estado,brigadistaInfo:{name:b.fullName,zone:com.zona,team:rnd(EQUIPOS),community:com.nombre},activities:[{date:asig,description:"Visita de campo",location:com.nombre,findings:"Sin novedades"}],totalHours:20+Math.floor(Math.random()*60),reportMonth:mes,reportYear:2025,workflowHistory:[{state:"ASIGNADO",date:asig,by:sup.id,comments:"Asignado"}],auditTrail:[{action:"CREATE",by:sup.id,date:asig,details:"Seed"}]});
          tr++;
        }
      }
    }
    console.log("\n=== COMPLETADO ===");
    console.log("Brigadistas nuevos: "+tb);
    console.log("Reportes creados  : "+tr);
    console.log("\nSUPERVISORES:");
    COMUNIDADES.forEach(c=>console.log("  "+c.nombre+": "+c.supervisor.username+" / admin123"));
    console.log("\nBRIGADISTAS: <nombre>.<zona>@brigada.com / brigada123");
    process.exit(0);
  }catch(err){console.error("Error:",err.message);process.exit(1);}
}
seed();
