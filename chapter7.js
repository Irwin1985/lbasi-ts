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
        throw new SyntaxError('Unknown character: `' + this.currentChar + '`');
    }
    advance() {
        this.pos++;
        if (this.isAtEnd()) {
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
class Expr {
}
class BinOp extends Expr {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitBinOpExpr(this);
    }
}
class Num extends Expr {
    constructor(token) {
        super();
        this.token = token;
        this.value = Number(this.token.value);
    }
    accept(visitor) {
        return visitor.visitNumExpr(this);
    }
}
class Parser {
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
    factor() {
        const token = this.currentToken;
        if (token.type == TokenType.INTEGER) {
            this.eat(TokenType.INTEGER);
            return new Num(token);
        }
        else if (token.type == TokenType.LPAREN) {
            this.eat(TokenType.LPAREN);
            const node = this.expr();
            this.eat(TokenType.RPAREN);
            return node;
        }
    }
    term() {
        var node = this.factor();
        while ([TokenType.MUL, TokenType.DIV].includes(this.currentToken.type)) {
            const token = this.currentToken;
            if (token.type == TokenType.MUL) {
                this.eat(TokenType.MUL);
            }
            else {
                this.eat(TokenType.DIV);
            }
            node = new BinOp(node, token, this.factor());
        }
        return node;
    }
    expr() {
        var node = this.term();
        while ([TokenType.PLUS, TokenType.MINUS].includes(this.currentToken.type)) {
            const token = this.currentToken;
            if (token.type == TokenType.PLUS) {
                this.eat(TokenType.PLUS);
            }
            else {
                this.eat(TokenType.MINUS);
            }
            node = new BinOp(node, token, this.term());
        }
        return node;
    }
    parse() {
        return this.expr();
    }
}
class Interpreter {
    constructor(parser) {
        this.parser = parser;
    }
    evaluate(expr) {
        return expr.accept(this);
    }
    interpret() {
        const tree = this.parser.parse();
        return this.evaluate(tree);
    }
    visitBinOpExpr(expr) {
        if (expr.op.type == TokenType.PLUS) {
            return Number(this.evaluate(expr.left)) + Number(this.evaluate(expr.right));
        }
        else if (expr.op.type == TokenType.MINUS) {
            return Number(this.evaluate(expr.left)) - Number(this.evaluate(expr.right));
        }
        else if (expr.op.type == TokenType.MUL) {
            return Number(this.evaluate(expr.left)) * Number(this.evaluate(expr.right));
        }
        else if (expr.op.type == TokenType.DIV) {
            return Number(this.evaluate(expr.left)) / Number(this.evaluate(expr.right));
        }
    }
    visitNumExpr(expr) {
        return expr.value;
    }
}
function main() {
    while (true) {
        const line = String(prompt('spi> '));
        if (line.length == 0)
            break;
        const lexer = new Lexer(line);
        const parser = new Parser(lexer);
        const interpreter = new Interpreter(parser);
        const result = interpreter.interpret();
        console.log(result);
    }
}
main();
//# sourceMappingURL=chapter7.js.map