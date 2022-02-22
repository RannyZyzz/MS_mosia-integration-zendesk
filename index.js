const express = require ('express');
const bodyParser = require ('body-parser')
const app = express();
const https = require('https');
const header = [];
const body = [];
const nChamador = [];
const eChamador = [];

app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');

 app.get('/',(req,res)=>{
    res.render('index.ejs')
 })

  app.get('/show',(req,res)=>{
    res.render('show.ejs')
 })

 app.post('/show',(req,res)=>{
   
const protocolo = req.body['protocolo'];
const status = req.body['status']


///REQUISICOES

 const options = {
    "method": "GET",
    "hostname": "api.mosia.chat",
    "path": "/v1/call/" + protocolo,
    "headers":{
        "Authorization":"tKK324LmPXHWQvV51ad4d6f01ba41e6da2bca94eff2c578",
        "content-type":"application/json"
    }
 }

 const option2 = {
    "method": "GET",
    "hostname": "api.mosia.chat",
    "path": "/v1/call/"+protocolo+'/messages',
    "headers": {
        "Authorization": "tKK324LmPXHWQvV51ad4d6f01ba41e6da2bca94eff2c578",
        "content-type": "application/json"
    }
}

 const option3 = {
    "method": "POST",
    "hostname": "mobilesaude.zendesk.com",
    "path": "/api/v2/tickets.json",
    "headers":{
        "content-type":"application/json",
        "authorization": "Basic cmFubmllckBtb2JpbGVzYXVkZS5jb20uYnI6NzIzMDk5UkBubmllcg=="
    }
};


 ///// FUNCOES

 function resolveAfter1Seconds(x){
    return new Promise(resolve => {
        setTimeout(() =>{
        resolve(x);
        },1000);
    });
 }

 function resolveAfter3Seconds(x){
    return new Promise(resolve =>{
        setTimeout(() =>{
            resolve(x);
        },3000);
    });
 }
 
 function resolveAfter5Seconds(x){
     return new Promise(resolve =>{
         setTimeout(()=>{
             resolve(x);
         },5000);
     });
 }

 function retornaArrayHeader(array){
    header.push(array);
 }

 function limpaArray(){
    header.length = 0;
    body.length = 0;
    nChamador.length = 0;
    eChamador.length = 0;
 }

 function nomeChamador(array){
     nChamador.push(array);
 }

 function emailChamador(array){
     eChamador.push(array);
 }


 /////////////////////

 const resq = https.request(options, function(res){

    var chunks = [];

    res.on("data", function(chunk){
        chunks.push(chunk);
    });

    res.on("end", function(){
        var obj = JSON.parse(chunks);
        nomeChamador(obj.caller.data[1]['value']);
        emailChamador(obj.caller.data[2]['value']);
        retornaArrayHeader('--- Chamador ---'+'\n'+
        'Protocolo: ' + obj.call['protocol']+'\n'+
        'Nome: ' + obj.caller.data[1]['value']+'\n'+
        'Telefone: ' + obj.caller.data[0]['value']+'\n'+
        'E-mail: ' + obj.caller.data[2]['value']+'\n'+
        '--- Atendente ---'+'\n'+
        'Nome: '+ obj.agent['name']+'\n')        
        });
    });
    resq.end();



const request = https.request(option2, function(res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", async function() {
        var obj = await resolveAfter1Seconds(JSON.parse(chunks));
        retornaArrayBody("--- MENSAGEM ---"+'\n');
        for(var i=0; i < obj.length; i++){
            retornaArrayBody(obj[i].from + ' : ' + obj[i].data['message']+ '\n')
        }
    });
    function retornaArrayBody(array){
        body.push(array);
    }

})
//request.end();

request.end(async function(){
    var y = await resolveAfter1Seconds(header);
    var x = await resolveAfter3Seconds(body);
    console.log(y);
    console.log(x);
    console.log(nChamador);
    console.log(eChamador);
});



async function f1() {

var x = await resolveAfter5Seconds (10);

var req = https.request(option3, function (res) {
    var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
    return (x);
  });
});


req.write(JSON.stringify({
    ticket: {
      subject: 'Atendimento Mosia Protocolo: '+ protocolo,
      comment: {body: header.toString()+ '\n' + body.toString()},
      priority: 'urgent',
      status: status,
      type: 'task',
      custom_fields: [
      {
        "id": 360007828613,
        "value": [
          "outros"
        ]
      },
      {
        "id": 360007828373,
        "value": [
          "android"
        ]
      },
      {
        "id": 360007828573,
        "value": "tarefa"
      },
      {
        "id": 360007828553,
        "value": "producao"
      },
      {
        "id": 360026736373,
        "value": "rotina_padrão"
      }
      ],
      requester: {name: nChamador.toString(), email: eChamador.toString()}
    }
  }));

  req.end();
limpaArray();
}
f1();
res.redirect('/show');

})


app.listen(3000, function(){
    console.log('Server running on port 3000');
})
