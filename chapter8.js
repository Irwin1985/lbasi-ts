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
        this.currentChar = this.text[this.pos]; // prime character
    }
    error() {
        throw new SyntaxError(`Unknown character '${this.currentChar}'`);
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
class UnaryOp extends Expr {
    constructor(token, expr) {
        super();
        this.token = token;
        this.expr = expr;
    }
    accept(visitor) {
        return visitor.visitUnaryOpExpr(this);
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
    // factor ::= unary | INTEGER | '(' expr ')'
    factor() {
        const token = this.currentToken;
        var node = null;
        switch (token.type) {
            case TokenType.PLUS:
                this.eat(TokenType.PLUS);
                node = new UnaryOp(token, this.factor());
                return node;
            case TokenType.MINUS:
                this.eat(TokenType.MINUS);
                node = new UnaryOp(token, this.factor());
                return node;
            case TokenType.INTEGER:
                this.eat(TokenType.INTEGER);
                return new Num(token);
            case TokenType.LPAREN:
                this.eat(TokenType.LPAREN);
                node = this.expr();
                this.eat(TokenType.RPAREN);
                return node;
            default:
                throw new SyntaxError('Expected primary expression.');
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
        const node = this.expr();
        if (this.currentToken.type != TokenType.EOF) {
            this.error();
        }
        return node;
    }
}
class Interpreter {
    constructor(parser) {
        this.parser = parser;
    }
    interpret() {
        const tree = this.parser.parse();
        if (tree == null) {
            return 0;
        }
        return this.evaluate(tree);
    }
    evaluate(expr) {
        return expr.accept(this);
    }
    visitBinOpExpr(expr) {
        switch (expr.op.type) {
            case TokenType.PLUS:
                return Number(this.evaluate(expr.left)) + Number(this.evaluate(expr.right));
            case TokenType.MINUS:
                return Number(this.evaluate(expr.left)) - Number(this.evaluate(expr.right));
            case TokenType.MUL:
                return Number(this.evaluate(expr.left)) * Number(this.evaluate(expr.right));
            case TokenType.DIV:
                return Number(this.evaluate(expr.left)) / Number(this.evaluate(expr.right));
        }
    }
    visitNumExpr(expr) {
        return expr.value;
    }
    visitUnaryOpExpr(expr) {
        switch (expr.token.type) {
            case TokenType.PLUS:
                return Number(this.evaluate(expr.expr));
            case TokenType.MINUS:
                return -Number(this.evaluate(expr.expr));
        }
    }
}
function main() {
    while (true) {
        const input = String(prompt('spi> '));
        if (input.length == 0)
            break;
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const interpreter = new Interpreter(parser);
        const result = interpreter.interpret();
        console.log(result);
    }
}
main();
//# sourceMappingURL=chapter8.js.map