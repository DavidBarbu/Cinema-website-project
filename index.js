const express = require('express');
const fs = require('fs');
const path = require("path");
const sharp = require('sharp');
var app = express();

app.set("view engine", "ejs");
console.log("Dirname: ", __dirname);
app.use("/resurse", express.static(path.join(__dirname, "resurse")));

function verificaImagini() {
    var textFisier = fs.readFileSync("resurse/json/galerie.json")
    var jsi = JSON.parse(textFisier);
    var caleGalerie = jsi.cale_galerie;
    let vectorCai = []
    for (let im of jsi.imagini) {
        var imVeche = path.join(caleGalerie, im.cale_imagine);
        var ext = path.extname(im.cale_imagine);
        var numeFisier = path.basename(im.cale_imagine, ext)
        let imNoua = path.join(caleGalerie + "/mic/", numeFisier + "-mic" + ".webp");
        

        if (!fs.existsSync(imNoua))
            sharp(imVeche)
                .resize(150)
                .toFile(imNoua, function (err) {
                    if (err)
                        console.log("eroare conversie", imVeche, "->", imNoua, err);
                });
        vectorCai.push({ mare: imVeche, mic: imNoua, timp:im.timp, descriere:im.descriere });

    }
    return vectorCai;
}

function galerieStatica(imagini){
    var d=new Date();
    let vectFinalImagini=[];
    for(let imag of imagini)
    {
        let interval_orar = imag.timp.replace('-',':').split(':');
        if(interval_orar[0]<=d.getHours() && interval_orar[2]>=d.getHours())
        {
            vectFinalImagini.push(imag);
        }
    
    }
    while(vectFinalImagini.length>10)
    {
        vectFinalImagini.pop();
    }
    return vectFinalImagini;
}

app.get(["/","/index"],function(req, res){

    res.render("pagini/index", {imagini: galerieStatica(verificaImagini()), ip:req.ip}); /* relative intotdeauna la folderul views*/
});



app.get("/galerie_statica",function(req,res){
    res.render("pagini/galerie_statica", {imagini: galerieStatica(verificaImagini())});
})


app.get("/", function (req, res) {
    /*
    res.setHeader("Content-Type","text/html");
    res.write("<!DOCTYPE html><html><head><title>Node</title></head><body><p style='color:red;'>Salutare!</p></body></html>");
    res.end();*/
    let vectorCai=verificaImagini()
    res.render("pagini/index",{imagini:vectorCai});
});

app.get("/data", function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.write("<!DOCTYPE html><html><head><title>Node</title></head><body>" + new Date() + "</body></html>");
});



app.get("/filme", function (req, res) {
    res.render("pagini/filme", { a: 10, b: 20 });
});

app.get("/*",function(req, res){    
    res.render("pagini"+req.url, function(err,rezultatRandare){
        if(err){
            if(err.message.includes("Failed to lookup view")){
                res.status(404).render("pagini/404");
            }
            else 
                throw err;
        }
        else{
            res.send(rezultatRandare);
        }
    });
});


app.listen(8080);
console.log("Serveru' e sus!")
verificaImagini();