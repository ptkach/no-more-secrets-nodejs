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

process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", function(data){
    processInput(data);
});

let maskChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+{}[]:;|\"'<>,.?/".split("");

class Char {
    constructor(initial){
        const doNotModifyChars = ["\n"," "];
        this.initial = initial;
        this.crypted = doNotModifyChars.includes(initial) ? initial : maskChars[Math.floor(Math.random()*maskChars.length)];
    }
}

class AllDataController {
    constructor(initial){
        this.initial = initial;
        this.rows = [];
        this.crypted = null;
    }
    getCryptedText(){
        this.rows = this.initial.split("\n");
        const cryptedChars = this.rows.map((row)=>{
            row = row.split("").map((char)=>{
                return new Char(char);
            });
            row.unshift(new Char("\n"));
            return row;
        });
        const cryptedText = [].concat.apply([], cryptedChars).reduce((res, char)=>{
            return res.push(char.crypted), res;
        },[]).join("");
        return cryptedText;
    }
    * decrypt(){
        yield this.initial;
    }
}

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

let processInput = (data) => {
    const allDataController = new AllDataController(data);
    process.stdout.write(allDataController.getCryptedText());
    const l = allDataController.rows.length + 1;
    setTimeout(function() {
        process.stdout.write('\033['+l+'A');
        process.stdout.clearScreenDown();
        //process.stdout.write(allDataController.initial);
    }, 2000);
};

