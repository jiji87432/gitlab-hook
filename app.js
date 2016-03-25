'use strict'
const http = require('http');
const child_process = require('child_process');

http.createServer(function (req, res) {
	let result = 'success';
	if(req.url === '/hook' && req.method === 'POST'){ 
		let arr = [];
	    req.on("data",function(data){
	        arr.push(data);
	    });
	    req.on("end",function(){
	        let data= Buffer.concat(arr).toString();
	        let ret = {};
	        try{
	            ret = JSON.parse(data);
	        }catch(err){
	        	console.log('JSON parse error, data: ' + data);
	        }

	        // 当提交的分支是develop时触发脚本
	        if(ret.ref === 'refs/heads/develop') {
	        	console.log('%s auto deploy', new Date().toLocaleString());
	        	let options = {
					encoding: 'utf8',
				  	timeout:600000
				};
				child_process.exec('sh ' + __dirname + '/hook.sh >> hook.log', options, function (err, stdout, stderr) {
				    console.log(err || stdout || stderr);
				});
	        } else {
                console.log('skip ref:' + ret.ref);
            }
	    })
	} else {
		result = 'Error:404';
	}
  	res.end(result);
}).listen(8081, function () {
  console.log('hook server is start');
});