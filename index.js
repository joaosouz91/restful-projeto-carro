const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
var mongoose = require('mongoose');


const CONNECTION_URL = "mongodb+srv://user_admin:163049@cluster0-gsqin.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "projeto-carro";


//Inicializa a biblioteca express
var app = Express();

//Cria um schema do mongoDB
var SchemaMongoDB = mongoose.Schema;

//Cria um object schema com os atributos do objeto que será criado na tabela do mongoDB
var carroObjectSchema = SchemaMongoDB({
    id: { type: Number, required: true },
    placa: { type: String },
    modelo: { type: String, required: true },
    marca: { type: String, required: true },
    ano : { type: Number, required: true },
    cor: { type: String, required: true },
    longitude: { type: Number },
    latitude: { type: Number },
    status: { type: String }
});

//Cria um object model do tipo carroObjectSchema
var CarroObject = mongoose.model("carros", carroObjectSchema);

app.post("/veiculo", (request, response) => {

    var lCarro = request.body;
    var msgRetorno = '';
    if( lCarro.id == null ) msgRetorno = 'O Id do carro é obrigatório.';
    else if( lCarro.modelo == null ) msgRetorno = 'O modelo do carro é obrigatório.';
    else if( lCarro.marca == null ) msgRetorno = 'O marca do carro é obrigatório.';
    else if( lCarro.cor == null ) msgRetorno = 'A cor do carro é obrigatória.';
    else if( lCarro.ano == null ) msgRetorno = 'O ano do carro é obrigatório.';
    
    //Avali mensagem de retorno
    if( msgRetorno  != null ) {
        res.status(400);
        res.send( msgRetorno );
    }

    carroObjectSchema.findOne({id : lCarro.id}, function (erro, carroObj) {
        console.log('>>>>>>>>>>>> carro retornado da consulta:' + carroObj);
        if (carroObj) {
            res.send(carroObj);
        } else {
          CarroSchema.create(lCarro, function (erro, carroCriado ) {
                if (erro) {
                    res.status(500);
                    res.send(erro);
                }
                else {
                    res.status(201);
                    res.send(carroCriado);
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


app.listen(3000, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("carros");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
    console.log(">>>>>>>>>>>>>>>>>> Iniciando server node <<<<<<<<<<<<<<<<<");
});