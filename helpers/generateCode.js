function generateCode(length){
    let code = "";
    let schema = "01881220413"
    for (let i = 0; i < length; i++) {
        code += schema.charAt(Math.floor(Math.random()* schema.length));
        
    }
    return code;
}
module.exports = generateCode;