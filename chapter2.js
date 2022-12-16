const prompt = require('prompt-sync')();
var TokenType;
(function (TokenType) {
    TokenType["INTEGER"] = "INTEGER";
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}
class Interpreter {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.currentChar = this.text[this.pos]; // prime the character
        this.currentToken = null;
    }
    error() {
        throw new SyntaxError('Error parsing input');
    }
    advance() {
        this.pos++;
        if (this.pos >= this.text.length) {
            this.currentChar = null;
        }
        else {
            this.currentChar = this.text[this.pos];
        }
    }
    skipWhitespace() {
        while (this.currentChar !== null && this.isSpace(this.currentChar)) {
            this.advance();
        }
    }
    integer() {
        var result = '';
        while (!this.isAtEnd() && this.isDigit(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return Number(result);
    }
    getNextToken() {
        while (!this.isAtEnd()) {
            if (this.isSpace(this.currentChar)) {
                this.skipWhitespace();
                continue;
            }
            if (this.isDigit(this.currentChar)) {
                return new Token(TokenType.INTEGER, this.integer());
            }
            if (this.currentChar === '+') {
                this.advance();
                return new Token(TokenType.PLUS, '+');
            }
            if (this.currentChar === '-') {
                this.advance();
                return new Token(TokenType.MINUS, '-');
            }
            this.error();
        }
        return new Token(TokenType.EOF, null);
    }
    eat(t) {
        if (this.currentToken.type == t) {
            this.currentToken = this.getNextToken();
        }
        else {
            this.error();
        }
    }
    expr() {
        this.currentToken = this.getNextToken();
        const left = this.currentToken;
        this.eat(TokenType.INTEGER);
        const op = this.currentToken;
        if (op.type === TokenType.PLUS) {
            this.eat(TokenType.PLUS);
        }
        else {
            this.eat(TokenType.MINUS);
        }
        const right = this.currentToken;
        this.eat(TokenType.INTEGER);
        // Performs the arithmetic
        if (op.type === TokenType.PLUS) {
            return Number(left.value) + Number(right.value);
        }
        else {
            return Number(left.value) - Number(right.value);
        }
    }
    isAtEnd() {
        return this.pos >= this.text.length;
    }
    isSpace(c) {
        return c === ' ' || c === '\r' || c === '\t' || c === '\n';
    }
    isDigit(c) {
        return '0' <= c && c <= '9';
    }
}
function main() {
    while (true) {
        const line = String(prompt('calc> '));
        if (line.length === 0)
            continue;
        const interpreter = new Interpreter(line);
        const result = interpreter.expr();
        console.log(result);
    }
}
main();
//# sourceMappingURL=chapter2.js.map