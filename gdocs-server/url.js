var {env} = require('process');

var url = ((id,token) => `http://165.227.35.8:8000/?id=${id}&token=${token}`);

console.log(url(env.ID,env.TOKEN));
