const express = require("express");
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const CONNECTION_URL = "mongodb://vehiclecontrol:san46480@ds145356.mlab.com:45356/heroku_857jfl69";

//const CONNECTION_URL = "mongodb+srv://admin:alwaysbegintran@cluster0-d7crm.mongodb.net/projeto-carro?retryWrites=true";

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
    ano: { type: Number, required: true },
    cor: { type: String, required: true },
    longitude: { type: Number },
    latitude: { type: Number },
    porta: { type: String },
    status: { type: String }
});

var carroModel = mongoose.model('Carros', carroSchema);

/**
 *  @description: Cria um novo veículo na base
 *  @author: 31SCJ
 *  @param: id (Id do veículo que deseja o status)
 *  @example: BODY >>>> {
 *                          "id": 124,
 *                          "ano": 2015,
 *                          "placa": "EVT-1213",
 *                          "cor": "PRETA",
 *                          "marca": "CHEVROLET",
 *                          "modelo": "CRUZE",
 *                          "longitude": 23,
 *                          "latitude": 23,
 *                          "porta": "fechada",
 *                          "status": "Em trânsito"
 *                       }
 */
app.post("/v1/veiculo", (req, res) => {

    var carroJson = req.body;
    console.log(carroJson);
    var msgRetorno = '';
    if (carroJson.id == null) msgRetorno = 'O Id do carro é obrigatório.';
    else if (carroJson.modelo == null) msgRetorno = 'O modelo do carro é obrigatório.';
    else if (carroJson.marca == null) msgRetorno = 'O marca do carro é obrigatório.';
    else if (carroJson.cor == null) msgRetorno = 'A cor do carro é obrigatória.';
    else if (carroJson.ano == null) msgRetorno = 'O ano do carro é obrigatório.';

    //Avalia mensagem de retorno
    if (msgRetorno != "") {
        res.status(400);
        res.send(msgRetorno);
    }

    carroModel.findOne({ id: carroJson.id }, function(err, obj) {
        console.log('>>>>>>>>>>>> carro retornado da consulta:' + obj);
        if (err) throw err;
        if (obj != null) {
            console.log('OBJETO RETORNADO: ', obj);
            res.send(obj);
        } else {
            carroModel.create(carroJson, function(err, obj) {
                if (err) {
                    res.status(500);
                    res.send(err);
                } else {
                    res.status(201);
                    res.send(obj);
                }
            });
        }
    });

});

/**
 *  @description: Recupera o status do veículo atraves do Id
 *  @author: 31SCJ
 *  @param: id (Id do veículo que deseja o status)
 */
app.get('/v1/veiculo/status/:id', function(req, res) {
    carroModel.findOne({ id: req.params.id }, function(erro, carroObj) {
        if (carroObj) {
            console.log('Status do carro: ' + carroObj.status);
            res.status(200);
            res.send({ status: carroObj.status });
        } else {
            res.status(404);
            res.send("Carro não encontrado");
        }
    });
})

/**
 *  @description: Atualiza o status do veículo atraves do Id
 *  @author: 31SCJ
 *  @param: id (Id do veículo que deseja o status)
 *  @example: Body >>>> {
                            "status": "Em trânsito"
                        } 
 */

app.put('/v1/veiculo/status/:id', function(req, res) {
    carroModel.findOne({ id: req.params.id }, function(erro, carroObj) {
        if (carroObj) {
            console.log('Antigo status do carro: ' + carroObj.status);
            var objetoJson = req.body;
            var statusOK = false;
            //Com esse try/catch será possivel verificar se o body veio corretamente preenchido
            try {
                if (objetoJson.status == 'Em trânsito' ||
                    objetoJson.status == 'Livre' ||
                    objetoJson.status == 'Off-line') {
                    //Caso o status seja um dos válidos acima a variavel é preenchida com TRUE
                    statusOK = true;
                }
            } catch (error) {
                console.log('Erro: ' + error);
                res.status(400);
                res.send('Requisição incompleta. Verifique o padrão de chamada para atualização de status.');
            }

            //Valida se o status preenchido foi um dos permitidos
            if (statusOK === true) {
                carroObj.status = objetoJson.status;

                var query = { 'id': carroObj.id }
                carroModel.findOneAndUpdate(query, carroObj, { upsert: true }, function(err, doc) {
                    if (err) {
                        console.log('Não foi possível atualizar o status do veículo. Erro: ' + err);
                        return res.send(500, { error: err });
                    }
                    console.log('Novo status do carro: ' + carroObj.status);
                    return res.status(200).send({ status: carroObj.status });
                });

            } else {
                //Devolve mensagem de erro para status invalido
                console.log("Insira um status válido!");
                res.status(400);
                res.send("Insira um status válido!");
            }
        } else {
            console.log("Carro não encontrado!");
            res.status(404);
            res.send("Carro não encontrado!");
        }
    });
})


/**
 *  @description: Atualiza o status da porta do veículo atraves do Id para 'aberta' ou 'fechada'
 *  @author: 31SCJ
 *  @param: id (Id do veículo que deseja o status da porta)
 *  @example: Body >>>> {
                            "porta": "Abrir"
                        } 
 */
app.put('/v1/veiculo/porta/:id', function(req, res) {

    carroModel.findOne({ id: req.params.id }, function(erro, carroObj) {
        if (carroObj) {
            console.log('>>>>>>>>> Carro: ' + carroObj);
            var objetoJson = req.body;
            var acaoOK = false;
            //Com esse try/catch será possivel verificar se o body veio corretamente preenchido
            try {

                console.log('>>>>>>>>> Carro ação: ' + objetoJson.acao);
                //Caso o status seja um dos válidos acima a variavel é preenchida com TRUE
                if (objetoJson.acao == 'Abrir' || objetoJson.acao == 'Fechar') {
                    acaoOK = true;
                }
            } catch (error) {
                console.log('Erro: ' + error);
                res.status(400);
                res.send('Requisição incompleta. Verifique o padrão de chamada para abertura de porta.');
            }

            if (acaoOK === true) {
                console.log('carroObj.porta= ' + carroObj.porta);
                if (objetoJson.acao == 'Abrir') {
                    carroObj.porta = 'aberta';
                } else if (objetoJson.acao == 'Fechar') {
                    carroObj.porta = 'fechada';
                }

                var query = { 'id': carroObj.id }
                carroModel.findOneAndUpdate(query, carroObj, { upsert: true }, function(err, doc) {
                    if (err) {
                        console.log('Não foi possível solicitar abertura/fechamento de portas. Erro: ' + err);
                        return res.send(500, { error: err });
                    }
                    console.log('A porta do carro foi ' + carroObj.porta);
                    return res.status(200).send({ porta: carroObj.porta });
                });
            } else {
                res.status(400);
                res.send('Ação inválida!');
            }
        } else {
            res.status(404);
            res.send("Carro não encontrado");
        }
    });
})


/**
 *  @description: Atualiza latitude e longitude do veiculo para novo endereço
 *  @author: 31SCJ
 *  @param: id (Id do veículo que deseja o status da porta)
 *  @example: Body >>>> {
                            "porta": "Abrir"
                        } 
 */
app.put('/v1/veiculo/deslocar/:id', function(req, res) {
    carroModel.findOne({ id: req.params.id }, function(erro, carroObj) {
        if (carroObj) {
            console.log('>>>>>>>>> Carro: ' + carroObj);
            var objetoJson = req.body;
            var enderecoOK = false;
            //Com esse try/catch será possivel verificar se o body veio corretamente preenchido
            try {
                console.log('>>>>>>>>> Deslocamento para: ' + objetoJson.latitude + ' - ' + objetoJson.longitude);
                //Caso os campos de latitude e longitude estejam preenchidos 
                //corretamente a ação é marcada com TRUE
                if (objetoJson.latitude != null || objetoJson.longitude != null) {
                    enderecoOK = true;
                }
            } catch (error) {
                console.log('Erro: ' + error);
                res.status(400);
                res.send('Requisição incompleta. Verifique o padrão de chamada para deslocamento.');
            }

            if (enderecoOK === true) {
                console.log('objetoJson.latitude= ' + objetoJson.latitude);
                console.log('objetoJson.longitude= ' + objetoJson.longitude);
                carroObj.latitude = objetoJson.latitude;
                carroObj.longitude = objetoJson.longitude;

                var query = { 'id': carroObj.id }
                carroModel.findOneAndUpdate(query, carroObj, { upsert: true }, function(err, doc) {
                    if (err) {
                        console.log('Não foi possível solicitar o deslocamento do veículo. Erro: ' + err);
                        return res.send(500, { error: err });
                    }
                    console.log('>>>>>>>>> O carro será deslocado para: ' + carroObj.latitude +
                        ' - ' + carroObj.longitude);

                    return res.status(200).send({ carroObj: carroObj });
                });
            } else {
                res.status(400);
                res.send('Latitude e longitude são requeridas para essa operação!');
            }
        } else {
            res.status(404);
            res.send("Carro não encontrado");
        }
    });
})




mongoose.Promise = global.Promise;
mongoose.connect(CONNECTION_URL);

mongoose.connection.on('connected', function() {
    console.log('=====Conexão estabelecida com sucesso=====');
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);
});

app.listen(port);


