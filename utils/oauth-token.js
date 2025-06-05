// import axios from 'axios';
// import getConfig from 'next/config'
// const {serverRuntimeConfig} = getConfig();
// const config = serverRuntimeConfig;
// import fs from 'fs';
// import { join } from 'path'
// import dayjs from 'dayjs';
// const doLogin = () => {

//     return new Promise((resolve, reject) => {
  
//         let serviciosPath =  "cache/token.json";
//         if(!fs.existsSync(serviciosPath)){
//             fs.writeFileSync(serviciosPath,"")
//         }
//         let serviciosStats = fs.statSync(serviciosPath);
//         let fileTime = dayjs(serviciosStats.ctime);
//         let now = dayjs();
    
//         if(now.diff(fileTime,'minute') < 1 & serviciosStats.size > 0){
//             let serviciosFile = fs.readFileSync(serviciosPath,{encoding: 'utf8'});

//             resolve(JSON.parse(serviciosFile));
//         } else {
//             axios.post(config.service_url + "/seguridad/validar",{codigo: config.service_user, clave: config.service_password}).then((res)=>{
            
//                 fs.writeFileSync(serviciosPath,JSON.stringify(res.data,null,true))
//                 resolve(res.data)
//             }).catch((e)=>{
//                 console.log("ERROR:::::::", e.message);
//                 reject(e)
//             })
//         }
    
//     })
// }
// export default doLogin;


import fs from 'fs';
import { join } from 'path';
import dayjs from 'dayjs';

const doLogin = () => {
    return new Promise((resolve, reject) => {
        let serviciosPath = "cache/token.json";
        if(fs.existsSync(serviciosPath)) {
            let serviciosStats = fs.statSync(serviciosPath);
            let fileTime = dayjs(serviciosStats.ctime);
            let now = dayjs();
            
            if(now.diff(fileTime, 'minute') < 1 && serviciosStats.size > 0) {
                let serviciosFile = fs.readFileSync(serviciosPath, {encoding: 'utf8'});
                resolve(JSON.parse(serviciosFile));
                return;
            }
        }
        reject(new Error("No hay sistema de autenticación disponible"));
    });
}

export default doLogin;