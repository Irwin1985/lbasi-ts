const prompt = require('prompt-sync')();
var TokenType;
(function (TokenType) {
    TokenType["INTEGER"] = "INTEGER";
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["MUL"] = "MUL";
    TokenType["DIV"] = "DIV";
    TokenType["LPAREN"] = "LPAREN";
    TokenType["RPAREN"] = "RPAREN";
    TokenType["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}
class Lexer {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.currentChar = this.text[this.pos];
    }
    error() {
        throw new SyntaxError('Invalid character: ' + this.currentChar);
    }
    advance() {
        this.pos++;
        if (this.pos > this.text.length) {
            this.currentChar = null;
        }
        else {
            this.currentChar = this.text[this.pos];
        }
    }
    skipWhitespace() {
        while (!this.isAtEnd() && this.isSpace(this.currentChar)) {
            this.advance();
        }
    }
    integer() {
        var lexeme = '';
        while (!this.isAtEnd() && this.isDigit(this.currentChar)) {
            lexeme += this.currentChar;
            this.advance();
        }
        return Number(lexeme);
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
            if (this.currentChar == '+') {
                this.advance();
                return new Token(TokenType.PLUS, '+');
            }
            if (this.currentChar == '-') {
                this.advance();
                return new Token(TokenType.MINUS, '-');
            }
            if (this.currentChar == '*') {
                this.advance();
                return new Token(TokenType.MUL, '*');
            }
            if (this.currentChar == '/') {
                this.advance();
                return new Token(TokenType.DIV, '/');
            }
            if (this.currentChar == '(') {
                this.advance();
                return new Token(TokenType.LPAREN, '(');
            }
            if (this.currentChar == ')') {
                this.advance();
                return new Token(TokenType.RPAREN, ')');
            }
            this.error();
        }
        return new Token(TokenType.EOF, null);
    }
    isAtEnd() {
        return this.pos >= this.text.length;
    }
    isSpace(c) {
        return c == ' ' || c == '\t' || c == '\r' || c == '\n';
    }
    isDigit(c) {
        return '0' <= c && c <= '9';
    }
}
class Interpreter {
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }
    error() {
        throw new SyntaxError('Invalid syntax.');
    }
    eat(t) {
        if (this.currentToken.type == t) {
            this.currentToken = this.lexer.getNextToken();
        }
        else {
            this.error();
        }
    }
    // factor: INTEGER;
    factor() {
        const token = this.currentToken;
        if (this.currentToken.type == TokenType.INTEGER) {
            this.eat(TokenType.INTEGER);
            return Number(token.value);
        }
        else if (this.currentToken.type == TokenType.LPAREN) {
            this.eat(TokenType.LPAREN);
            const result = this.expr();
            this.eat(TokenType.RPAREN);
            return result;
        }
    }
    // term ::= factor ('*'|'/' factor)*
    term() {
        var result = this.factor();
        while ([TokenType.MUL, TokenType.DIV].includes(this.currentToken.type)) {
            if (this.currentToken.type == TokenType.MUL) {
                this.eat(TokenType.MUL);
                result *= this.factor();
            }
            else {
                this.eat(TokenType.DIV);
                result /= this.factor();
            }
        }
        return result;
    }
    // expr ::= term ('+'|'-' term)*
    expr() {
        var result = this.term();
        while ([TokenType.PLUS, TokenType.MINUS].includes(this.currentToken.type)) {
            if (this.currentToken.type == TokenType.PLUS) {
                this.eat(TokenType.PLUS);
                result += this.term();
            }
            else {
                this.eat(TokenType.MINUS);
                result -= this.term();
            }
        }
        return result;
    }
}
function main() {
    while (true) {
        const input = String(prompt('calc> '));
        if (input.length == 0) {
            break;
        }
        const lexer = new Lexer(input);
        const interpreter = new Interpreter(lexer);
        const result = interpreter.expr();
        console.log(result);
    }
}
main();
//# sourceMappingURL=chapter6.js.map