const prompt = require('prompt-sync')();

enum TokenType {
    INTEGER = 'INTEGER',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    MUL = 'MUL',
    DIV = 'DIV',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    EOF = 'EOF'
}

class Token {
    type: TokenType;
    value: any;

    constructor(type: TokenType, value: any) {
        this.type = type;
        this.value = value;
    }
}

class Lexer {
    text: string;
    pos: number;
    currentChar: string;

    constructor(text: string) {
        this.text = text;
        this.pos = 0;
        this.currentChar = this.text[this.pos]; // prime character
    }

    error(): never {
        throw new SyntaxError(`Unknown character '${this.currentChar}'`);
    }

    advance() {
        this.pos++;
        if (this.isAtEnd()) {
            this.currentChar = null;
        } else {
            this.currentChar = this.text[this.pos];
        }
    }

    skipWhitespace() {
        while (!this.isAtEnd() && this.isSpace(this.currentChar)) {
            this.advance();
        }
    }

    integer(): number {
        var lexeme = '';

        while (!this.isAtEnd() && this.isDigit(this.currentChar)) {
            lexeme += this.currentChar;
            this.advance();
        }

        return Number(lexeme);
    }

    getNextToken(): Token {
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

    isAtEnd(): boolean {
        return this.pos >= this.text.length;
    }

    isSpace(c: string): boolean {
        return c == ' ' || c == '\t' || c == '\r' || c == '\n';
    }

    isDigit(c: string): boolean {
        return '0' <= c && c <= '9';
    }
}

interface Visitor {
    visitBinOpExpr(expr: BinOp): any;
    visitNumExpr(expr: Num): any;
    visitUnaryOpExpr(expr: UnaryOp): any;
}

abstract class Expr {
    abstract accept(visitor: Visitor): any;
}

class BinOp extends Expr {
    left: Expr;
    op: Token;
    right: Expr;

    constructor(left: Expr, op: Token, right: Expr) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }

    accept(visitor: Visitor): any {
        return visitor.visitBinOpExpr(this);
    }
}

class Num extends Expr {
    token: Token;
    value: number;

    constructor(token: Token) {
        super();
        this.token = token;
        this.value = Number(this.token.value);
    }

    accept(visitor: Visitor): any {
        return visitor.visitNumExpr(this);
    }
}

class UnaryOp extends Expr {
    token: Token;
    expr: Expr;

    constructor(token: Token, expr: Expr) {
        super();
        this.token = token;
        this.expr = expr;
    }

    accept(visitor: Visitor): any {
        return visitor.visitUnaryOpExpr(this);
    }
}

class Parser {
    lexer: Lexer;
    currentToken: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    error(): never {
        throw new SyntaxError('Invalid syntax.');
    }

    eat(t: TokenType) {
        if (this.currentToken.type == t) {
            this.currentToken = this.lexer.getNextToken();
        } else {
            this.error();
        }
    }

    // factor ::= unary | INTEGER | '(' expr ')'
    factor(): Expr {
        const token: Token = this.currentToken;
        var node: Expr = null;
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

    term(): Expr {
        var node: Expr = this.factor();
        while ([TokenType.MUL, TokenType.DIV].includes(this.currentToken.type)) {
            const token: Token = this.currentToken;
            if (token.type == TokenType.MUL) {
                this.eat(TokenType.MUL);
            } else {
                this.eat(TokenType.DIV);
            }
            node = new BinOp(node, token, this.factor());
        }

        return node;
    }

    expr(): Expr {
        var node: Expr = this.term();

        while ([TokenType.PLUS, TokenType.MINUS].includes(this.currentToken.type)) {
            const token: Token = this.currentToken;
            if (token.type == TokenType.PLUS) {
                this.eat(TokenType.PLUS);
            } else {
                this.eat(TokenType.MINUS);
            }
            node = new BinOp(node, token, this.term());
        }

        return node;
    }

    parse(): Expr {
        const node: Expr = this.expr();
        if (this.currentToken.type != TokenType.EOF) {
            this.error();
        }
        return node;
    }
}

class Interpreter implements Visitor {
    parser: Parser;

    constructor(parser: Parser) {
        this.parser = parser;
    }

    interpret(): number {
        const tree = this.parser.parse();
        if (tree == null) {
            return 0;
        }
        return this.evaluate(tree);
    }

    evaluate(expr: Expr): any {
        return expr.accept(this);
    }

    visitBinOpExpr(expr: BinOp): any {
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

    visitNumExpr(expr: Num): any {
        return expr.value;
    }

    visitUnaryOpExpr(expr: UnaryOp): any {
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
        if (input.length == 0) break;
        const lexer: Lexer = new Lexer(input);
        const parser: Parser = new Parser(lexer);
        const interpreter: Interpreter = new Interpreter(parser);
        const result = interpreter.interpret();
        console.log(result);
    }
}

main();