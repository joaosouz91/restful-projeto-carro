const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const CONNECTION_URL = "mongodb+srv://admin:alwaysbegintran@cluster0-d7crm.mongodb.net/projeto-carro?retryWrites=true";

//Inicializa a biblioteca express
var app = express();
//Inicializa Body-Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Cria um schema do mongoDB
var Schema = mongoose.Schema;

//Cria um object schema com os atributos do objeto que será criado na tabela do mongoDB
var carroSchema = new Schema({
    id: { type: String, required: true },
    placa: { type: String },
    modelo: { type: String, required: true },
    marca: { type: String, required: true },
    ano : { type: Number, required: true },
    cor: { type: String, required: true },
    longitude: { type: Number },
    latitude: { type: Number },
    status: { type: String }
});

var carroModel = mongoose.model('Carros', carroSchema);

app.post("/veiculo", (req, res) => {

    var carroJson = req.body;
    console.log(carroJson);
    var msgRetorno = '';
    if( carroJson.id == null ) msgRetorno = 'O Id do carro é obrigatório.';
    else if( carroJson.modelo == null ) msgRetorno = 'O modelo do carro é obrigatório.';
    else if( carroJson.marca == null ) msgRetorno = 'O marca do carro é obrigatório.';
    else if( carroJson.cor == null ) msgRetorno = 'A cor do carro é obrigatória.';
    else if( carroJson.ano == null ) msgRetorno = 'O ano do carro é obrigatório.';
    
    //Avalia mensagem de retorno
    if( msgRetorno != "" ) {
        res.status(400);
        res.send( msgRetorno );
    }

    carroModel.findOne( { id : carroJson.id } , function (err, obj) {
        console.log('>>>>>>>>>>>> carro retornado da consulta:' + obj);
        if (err) throw err;
        if (obj!=null) {
            console.log('OBJETO RETORNADO: ', obj);
            res.send(obj);
        } else {
            carroModel.create(carroJson, function (err, obj ) {
                if (err) {
                    res.status(500);
                    res.send(err);
                }
                else {
                    res.status(201);
                    res.send(obj);
                }
            });
        }
    });

    /*
    collection.insert(request.body, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });*/
});
mongoose.Promise = global.Promise;
mongoose.connect(CONNECTION_URL);

mongoose.connection.on('connected', function () {
    console.log('=====Conexão estabelecida com sucesso=====');
});

mongoose.connection.on('error',function (err) {  
    console.log('Mongoose default connection error: ' + err);
  });

app.listen(3000);