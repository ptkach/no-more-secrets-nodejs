#!/usr/bin/env node

//process.stdout.clearLine();  // clear current text
//process.stdout.cursorTo(0);  // move cursor to beginning of line
//process.stdout.write(data);  // write text

//var intercept = require("intercept-stdout");
//
//var unhook_intercept = intercept(function(txt) {
//    return txt.replace( /this/i , 'that' );
//});
//
//console.log("This text is being modified");

//let processInput = (data) => {
//    const allDataController = new AllDataController(data);
//    process.stdout.write('\033[0f');
//    process.stdout.clearScreenDown();
//    process.stdout.write(allDataController.getCryptedText());
//    setTimeout(function() {
//        process.stdout.write('\033[0f');
//        process.stdout.clearScreenDown();
//        process.stdout.write(allDataController.initial);
//    }, 2000);
//};

process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", function(data){
    processInput(data);
});

let maskChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+{}[]:;|\"'<>,.?/".split("");

class Char {
    constructor(initial, animationInterval=3){
        this.initial = initial;
        this.decrypted = false;
        this.animationInterval = animationInterval;
        this.crypted = Char.doNotModifyChars.includes(initial) ? initial : maskChars[Math.floor(Math.random()*maskChars.length)];
    }
    * decrypt(){
        for(let i=0;i<this.animationInterval;i++){
            yield this.crypted = Char.doNotModifyChars.includes(this.initial) ? this.initial : maskChars[Math.floor(Math.random()*maskChars.length)];
        }
        this.decrypted = true;
        this.crypted = null;
    }
}
Char.doNotModifyChars = ["\n"," "];

class AllDataController {
    constructor(initial){
        this.initial = initial;
        this.rows = [];
        this.crypted = null;
    }
    getTextFromCryptedChars(cryptedChars){
        return [].concat.apply([], cryptedChars).reduce((res, char)=>{
            return res.push(char.crypted || char.initial), res;
        },[]).join("");
    }
    getCryptedCharsFromText(){
        this.rows = this.initial.split("\n");
        this.crypted = this.rows.reduce((res, row)=>{//[new Char, new Char, new Char,new Char, new Char, new Char...]
            row = row.split("").map((char)=>{
                return new Char(char);
            });
            row.unshift(new Char("\n"));
            return [...res, ...row];
        }, []);
        return this.crypted;
    }
    crypt(){
        return this.getTextFromCryptedChars(this.getCryptedCharsFromText())
    }
    decrypt(){
        const itemsToDecrypt = this.crypted.filter((item)=>{
            return !item.decrypted;
        });
        if(!itemsToDecrypt.length){
            return false;
        }
        this.crypted.forEach((cryptedElement)=>{
            cryptedElement.decrypt().next();
        });
        return this.getTextFromCryptedChars(this.crypted);
    }
}



let processInput = (data) => {
    const allDataController = new AllDataController(data);
    process.stdout.write(allDataController.crypt());

    let interval = setInterval(()=>{
        const l = allDataController.rows.length,
            value = allDataController.decrypt();
        process.stdout.write('\033['+l+'A');
        process.stdout.clearScreenDown();
        if(value){
            process.stdout.write(value);
        } else {
            clearInterval(interval);
        }
    }, 500);
};

