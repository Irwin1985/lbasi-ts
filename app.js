const prompt = require('prompt-sync')();
var TokenType;
(function (TokenType) {
    TokenType["INTEGER"] = "INTEGER";
    TokenType["PLUS"] = "PLUS";
    TokenType["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    toString() {
        return `Token(${this.type}, ${this.value})`;
    }
}
class Interpreter {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.currentToken = null;
    }
    error() {
        throw new SyntaxError('Error parsing input.');
    }
    getNextToken() {
        var text = this.text;
        if (this.pos >= text.length) {
            return new Token(TokenType.EOF, null);
        }
        var currentChar = text[this.pos];
        if (this.isDigit(currentChar)) {
            var token = new Token(TokenType.INTEGER, Number(currentChar));
            this.pos++;
            return token;
        }
        if (currentChar === '+') {
            var token = new Token(TokenType.PLUS, currentChar);
            this.pos++;
            return token;
        }
        this.error();
    }
    eat(type) {
        if (this.currentToken.type === type) {
            this.currentToken = this.getNextToken();
        }
        else {
            this.error();
        }
    }
    expr() {
        this.currentToken = this.getNextToken();
        var left = this.currentToken;
        this.eat(TokenType.INTEGER);
        var op = this.currentToken;
        this.eat(TokenType.PLUS);
        var right = this.currentToken;
        this.eat(TokenType.INTEGER);
        var result = Number(left.value) + Number(right.value);
        return result;
    }
    isDigit(c) {
        return '0' <= c && c <= '9';
    }
}
function main() {
    while (true) {
        var line = String(prompt('calc> '));
        if (line.endsWith('\n')) {
            line = line.substring(0, -1);
        }
        var interpreter = new Interpreter(line);
        var result = interpreter.expr();
        console.log(result);
    }
}
main();
//# sourceMappingURL=app.js.map