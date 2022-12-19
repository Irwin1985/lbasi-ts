"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
/*
 * Lexer
 */
// Reserved keywords
var TokenType;
(function (TokenType) {
    TokenType["INTEGER"] = "INTEGER";
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["MUL"] = "MUL";
    TokenType["DIV"] = "DIV";
    TokenType["LPAREN"] = "LPAREN";
    TokenType["RPAREN"] = "RPAREN";
    TokenType["ID"] = "ID";
    TokenType["ASSIGN"] = "ASSIGN";
    TokenType["BEGIN"] = "BEGIN";
    TokenType["END"] = "END";
    TokenType["WRITELN"] = "WRITELN";
    TokenType["SEMI"] = "SEMI";
    TokenType["COMMA"] = "COMMA";
    TokenType["DOT"] = "DOT";
    TokenType["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}
const keywords = new Map();
keywords.set('BEGIN', new Token(TokenType.BEGIN, 'BEGIN'));
keywords.set('END', new Token(TokenType.END, 'END'));
keywords.set('WRITELN', new Token(TokenType.WRITELN, 'WRITELN'));
class Lexer {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.currentChar = this.text[this.pos];
    }
    error() {
        throw new SyntaxError(`Unexpected character '${this.currentChar}'`);
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
    peek() {
        const peekPos = this.pos + 1;
        if (peekPos >= this.text.length) {
            return '';
        }
        else {
            return this.text[peekPos];
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
    id() {
        var lexeme = '';
        while (!this.isAtEnd() && this.isAlpha(this.currentChar)) {
            lexeme += this.currentChar;
            this.advance();
        }
        if (keywords.has(lexeme)) {
            return keywords.get(lexeme);
        }
        else {
            return new Token(TokenType.ID, lexeme);
        }
    }
    getNextToken() {
        while (!this.isAtEnd()) {
            if (this.isSpace(this.currentChar)) {
                this.skipWhitespace();
                continue;
            }
            if (this.isAlpha(this.currentChar)) {
                return this.id();
            }
            if (this.isDigit(this.currentChar)) {
                return new Token(TokenType.INTEGER, this.integer());
            }
            if (this.currentChar == ':' && this.peek() == '=') {
                this.advance();
                this.advance();
                return new Token(TokenType.ASSIGN, ':=');
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
            if (this.currentChar == ';') {
                this.advance();
                return new Token(TokenType.SEMI, ';');
            }
            if (this.currentChar == '.') {
                this.advance();
                return new Token(TokenType.DOT, '.');
            }
            if (this.currentChar == ',') {
                this.advance();
                return new Token(TokenType.COMMA, ',');
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
    isAlpha(c) {
        return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c == '_';
    }
}
class Expr {
}
class Stmt {
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
        return visitor.visitUnaryOp(this);
    }
}
class Compound extends Stmt {
    constructor(children) {
        super();
        this.children = children;
    }
    accept(visitor) {
        visitor.visitCompoundStmt(this);
    }
}
class Assign extends Stmt {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }
    accept(visitor) {
        visitor.visitAssignStmt(this);
    }
}
class Var extends Expr {
    constructor(token) {
        super();
        this.token = token;
        this.value = String(this.token.value);
    }
    accept(visitor) {
        return visitor.visitVarStmt(this);
    }
}
class NoOp extends Stmt {
    accept(visitor) {
        visitor.visitNoOpStmt(this);
    }
}
class WriteLn extends Stmt {
    constructor(expressionList) {
        super();
        this.expressionList = expressionList;
    }
    accept(visitor) {
        visitor.visitWriteLnStmt(this);
    }
}
/*
 * Parser
 * */
class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }
    error(message) {
        throw new SyntaxError(message);
    }
    eat(t) {
        if (this.currentToken.type == t) {
            this.currentToken = this.lexer.getNextToken();
            return true;
        }
        else {
            this.error(`Expected token to be '${t}' but got '${this.currentToken.type}' instead.`);
        }
    }
    // program ::= compoundStatement '.'
    program() {
        const node = this.compoundStatement();
        this.eat(TokenType.DOT);
        return node;
    }
    // compoundStatement ::= 'BEGIN' statementList 'END'
    compoundStatement() {
        this.eat(TokenType.BEGIN);
        const nodes = this.statementList();
        this.eat(TokenType.END);
        return new Compound(nodes);
    }
    // statementList ::= statement (';' statement)*
    statementList() {
        const node = [];
        node.push(this.statement());
        while (this.currentToken.type == TokenType.SEMI) {
            this.eat(TokenType.SEMI);
            node.push(this.statement());
        }
        // check for identifier
        if (this.currentToken.type == TokenType.ID) {
            this.error(`Unexpected token IDENTIFIER in statement list.`);
        }
        return node;
    }
    // statement ::= compoundStatement | assignStatement | empty
    statement() {
        var node;
        switch (this.currentToken.type) {
            case TokenType.BEGIN:
                return this.compoundStatement();
            case TokenType.ID:
                return this.assignmentStatement();
            case TokenType.WRITELN:
                return this.writelnStatement();
            default:
                return this.emptyStatement();
        }
    }
    // assignmentStatement ::= variable '=' expr
    assignmentStatement() {
        const left = this.variable();
        const token = this.currentToken;
        this.eat(TokenType.ASSIGN);
        const right = this.expression();
        return new Assign(left, token, right);
    }
    // variable ::= IDENTIFIER
    variable() {
        const node = this.currentToken;
        this.eat(TokenType.ID);
        return new Var(node);
    }
    // writelnStatement ::= 'WRITELN' expr*
    writelnStatement() {
        var expressionList = [];
        this.eat(TokenType.WRITELN);
        this.eat(TokenType.LPAREN);
        if (this.currentToken.type != TokenType.RPAREN) {
            expressionList.push(this.expression());
            while (this.currentToken.type == TokenType.COMMA) {
                this.eat(TokenType.COMMA);
                expressionList.push(this.expression());
            }
        }
        this.eat(TokenType.RPAREN);
        return new WriteLn(expressionList);
    }
    // empty ::= none
    emptyStatement() {
        return new NoOp();
    }
    // expression ::= term ('+' | '-' term)*
    expression() {
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
    // term ::= factor ('*'|'/' factor)*
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
    // factor ::= '+' factor | '-' factor | INTEGER | '(' expression ')' | variable
    factor() {
        const token = this.currentToken;
        switch (token.type) {
            case TokenType.PLUS:
                this.eat(TokenType.PLUS);
                return new UnaryOp(token, this.factor());
            case TokenType.MINUS:
                this.eat(TokenType.MINUS);
                return new UnaryOp(token, this.factor());
            case TokenType.INTEGER:
                this.eat(TokenType.INTEGER);
                return new Num(token);
            case TokenType.LPAREN:
                this.eat(TokenType.LPAREN);
                const result = this.expression();
                this.eat(TokenType.RPAREN);
                return result;
            case TokenType.ID:
                return this.variable();
            default:
                this.error(`Invalid primary expression: ${token}`);
        }
    }
    parse() {
        const node = this.program();
        if (this.currentToken.type != TokenType.EOF) {
            this.error('Expected end of file but got: ${this.currentToken}');
        }
        return node;
    }
}
/*
 * Interpreter
 */
class Interpreter {
    constructor(parser) {
        this.globalScope = new Map();
        this.parser = parser;
    }
    interpret() {
        const tree = this.parser.parse();
        if (tree == null) {
            return 0;
        }
        for (var i = 0; i < tree.children.length; i++) {
            this.execute(tree.children[i]);
        }
    }
    execute(stmt) {
        stmt.accept(this);
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
    visitUnaryOp(expr) {
        switch (expr.token.type) {
            case TokenType.PLUS:
                return Number(this.evaluate(expr.expr));
            case TokenType.MINUS:
                return -Number(this.evaluate(expr.expr));
        }
    }
    visitCompoundStmt(stmt) {
        for (var i = 0; i < stmt.children.length; i++) {
            this.execute(stmt.children[i]);
        }
    }
    visitAssignStmt(stmt) {
        const variableName = stmt.left.value;
        this.globalScope.set(variableName, this.evaluate(stmt.right));
    }
    visitVarStmt(stmt) {
        const variableName = stmt.value;
        if (this.globalScope.has(variableName)) {
            return this.globalScope.get(variableName);
        }
        throw new SyntaxError(`Undefined variable: '${variableName}'`);
    }
    visitWriteLnStmt(stmt) {
        for (var i = 0; i < stmt.expressionList.length; i++) {
            console.log(this.evaluate(stmt.expressionList[i]));
        }
    }
    visitNoOpStmt(stmt) {
        return null;
    }
}
function main() {
    const sourceCode = fs.readFileSync('C:\\Users\\irwin.SUBIFOR\\source\\repos\\lbasi\\sample.pas', 'utf-8');
    const lexer = new Lexer(sourceCode);
    const parser = new Parser(lexer);
    const interpreter = new Interpreter(parser);
    interpreter.interpret();
}
main();
//# sourceMappingURL=chapter9.js.map