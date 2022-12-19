import * as fs from 'fs';

/*
 * Lexer
 */

// Reserved keywords

enum TokenType {
    INTEGER = 'INTEGER',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    MUL = 'MUL',
    DIV = 'DIV',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    ID = 'ID',
    ASSIGN = 'ASSIGN',
    BEGIN = 'BEGIN',
    END = 'END',
    WRITELN = 'WRITELN',
    SEMI = 'SEMI', 
    COMMA = 'COMMA',
    DOT = 'DOT',
    EOF = 'EOF',
}

class Token {
    type: TokenType;
    value: any;

    constructor(type: TokenType, value: any) {
        this.type = type;
        this.value = value;
    }
}

const keywords = new Map<string, Token>();
keywords.set('BEGIN', new Token(TokenType.BEGIN, 'BEGIN'));
keywords.set('END', new Token(TokenType.END, 'END'));
keywords.set('WRITELN', new Token(TokenType.WRITELN, 'WRITELN'));


class Lexer {
    text: string;
    pos: number;
    currentChar: string;

    constructor(text: string) {
        this.text = text;
        this.pos = 0;
        this.currentChar = this.text[this.pos];
    }

    error(): never {
        throw new SyntaxError(`Unexpected character '${this.currentChar}'`);
    }

    advance() {
        this.pos++;
        if (this.isAtEnd()) {
            this.currentChar = null;
        } else {
            this.currentChar = this.text[this.pos];
        }
    }

    peek(): string {
        const peekPos = this.pos + 1;
        if (peekPos >= this.text.length) {
            return '';
        } else {
            return this.text[peekPos];
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
    
    id(): Token {
        var lexeme = '';
        while (!this.isAtEnd() && this.isAlpha(this.currentChar)) {
            lexeme += this.currentChar;
            this.advance();
        }

        if (keywords.has(lexeme)) {
            return keywords.get(lexeme);
        } else {
            return new Token(TokenType.ID, lexeme);
        }
    }

    getNextToken(): Token {
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

    isAtEnd(): boolean {
        return this.pos >= this.text.length;
    }

    isSpace(c: string): boolean {
        return c == ' ' || c == '\t' || c == '\r' || c == '\n';
    }

    isDigit(c: string): boolean {
        return '0' <= c && c <= '9';
    }

    isAlpha(c: string): boolean {
        return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c == '_';
    }
}

interface Visitor {
    visitBinOpExpr(expr: BinOp): any;
    visitNumExpr(expr: Num): any;
    visitUnaryOp(expr: UnaryOp): any;
    visitCompoundStmt(stmt: Compound);
    visitAssignStmt(stmt: Assign);
    visitVarStmt(stmt: Var);
    visitNoOpStmt(stmt: NoOp);
    visitWriteLnStmt(stmt: WriteLn);
}

abstract class Expr {
    abstract accept(visitor: Visitor): any;
}

abstract class Stmt {
    abstract accept(visitor: Visitor);
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
        return visitor.visitUnaryOp(this);
    }
}

class Compound extends Stmt {
    children: Stmt[];

    constructor(children: Stmt[]) {
        super();
        this.children = children;
    }

    accept(visitor: Visitor) {
        visitor.visitCompoundStmt(this);
    }
}

class Assign extends Stmt {
    left: Var;
    op: Token;
    right: Expr;

    constructor(left: Var, op: Token, right: Expr) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }

    accept(visitor: Visitor) {
        visitor.visitAssignStmt(this);
    }
}

class Var extends Expr {
    token: Token;
    value: string;

    constructor(token: Token) {
        super();
        this.token = token;
        this.value = String(this.token.value);
    }

    accept(visitor: Visitor): any {
        return visitor.visitVarStmt(this);
    }
}

class NoOp extends Stmt {
    accept(visitor: Visitor) {
        visitor.visitNoOpStmt(this);
    }
}

class WriteLn extends Stmt {
    expressionList: Expr[];

    constructor(expressionList: Expr[]) {
        super();
        this.expressionList = expressionList;
    }

    accept(visitor: Visitor) {
        visitor.visitWriteLnStmt(this);
    }
}

/*
 * Parser
 * */
class Parser {
    lexer: Lexer;
    currentToken: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    error(message: string): never {
        throw new SyntaxError(message);
    }

    eat(t: TokenType) {
        if (this.currentToken.type == t) {
            this.currentToken = this.lexer.getNextToken();
            return true;
        } else {
            this.error(`Expected token to be '${t}' but got '${this.currentToken.type}' instead.`);
        }
    }
    // program ::= compoundStatement '.'
    program(): Compound {
        const node = this.compoundStatement();
        this.eat(TokenType.DOT);

        return node;
    }
    // compoundStatement ::= 'BEGIN' statementList 'END'
    compoundStatement(): Compound {
        this.eat(TokenType.BEGIN);
        const nodes = this.statementList();
        this.eat(TokenType.END);

        return new Compound(nodes);
    }

    // statementList ::= statement (';' statement)*
    statementList(): Stmt[] {
        const node: Stmt[] = [];
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
    statement(): Stmt {
        var node: Stmt;
        switch (this.currentToken.type) {
            case TokenType.BEGIN:
                return this.compoundStatement();
            case TokenType.ID:
                return this.assignmentStatement()
            case TokenType.WRITELN:
                return this.writelnStatement();
            default:
                return this.emptyStatement();
        }       
    }

    // assignmentStatement ::= variable '=' expr
    assignmentStatement(): Assign {
        const left: Var = this.variable();
        const token: Token = this.currentToken;
        this.eat(TokenType.ASSIGN);
        const right: Expr = this.expression();

        return new Assign(left, token, right);
    }

    // variable ::= IDENTIFIER
    variable(): Var {
        const node = this.currentToken;

        this.eat(TokenType.ID);
        return new Var(node);
    }

    // writelnStatement ::= 'WRITELN' expr*
    writelnStatement(): WriteLn {
        var expressionList: Expr[] = [];

        this.eat(TokenType.WRITELN);
        this.eat(TokenType.LPAREN);

        if (this.currentToken.type != TokenType.RPAREN) {
            expressionList.push(this.expression());
            while (this.currentToken.type == TokenType.COMMA) {
                this.eat(TokenType.COMMA)
                expressionList.push(this.expression());
            }
        }

        this.eat(TokenType.RPAREN);

        return new WriteLn(expressionList);
    }

    // empty ::= none
    emptyStatement(): NoOp {
        return new NoOp();
    }

    // expression ::= term ('+' | '-' term)*
    expression(): Expr {
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

    // term ::= factor ('*'|'/' factor)*
    term(): Expr {
        var node = this.factor();

        while ([TokenType.MUL, TokenType.DIV].includes(this.currentToken.type)) {
            const token = this.currentToken;
            if (token.type == TokenType.MUL) {
                this.eat(TokenType.MUL);
            } else {
                this.eat(TokenType.DIV);
            }
            node = new BinOp(node, token, this.factor());
        }

        return node;
    }

    // factor ::= '+' factor | '-' factor | INTEGER | '(' expression ')' | variable
    factor(): Expr {
        const token: Token = this.currentToken;
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

    parse(): Compound {
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

class Interpreter implements Visitor {
    parser: Parser;
    globalScope: Map<string, object> = new Map<string, object>();

    constructor(parser: Parser) {
        this.parser = parser;
    }    

    interpret() {
        const tree: Compound = this.parser.parse();
        if (tree == null) {
            return 0;
        }
        
        for (var i = 0; i < tree.children.length; i++) {
            this.execute(tree.children[i]);
        }
    }

    execute(stmt: Stmt) {
        stmt.accept(this);
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

    visitUnaryOp(expr: UnaryOp): any {
        switch (expr.token.type) {
            case TokenType.PLUS:
                return Number(this.evaluate(expr.expr));
            case TokenType.MINUS:
                return -Number(this.evaluate(expr.expr));
        }
    }

    visitCompoundStmt(stmt: Compound) {
        for (var i = 0; i < stmt.children.length; i++) {
            this.execute(stmt.children[i]);
        }
    }

    visitAssignStmt(stmt: Assign) {
        const variableName = stmt.left.value;
        this.globalScope.set(variableName, this.evaluate(stmt.right));
    }

    visitVarStmt(stmt: Var) {
        const variableName = stmt.value;
        if (this.globalScope.has(variableName)) {
            return this.globalScope.get(variableName);
        }
        throw new SyntaxError(`Undefined variable: '${variableName}'`);
    }

    visitWriteLnStmt(stmt: WriteLn) {
        for (var i = 0; i < stmt.expressionList.length; i++) {
            console.log(this.evaluate(stmt.expressionList[i]));
        }
    }

    visitNoOpStmt(stmt: NoOp) {
        return null;
    }
}

function main() {
    const sourceCode = fs.readFileSync('C:\\Users\\irwin.SUBIFOR\\source\\repos\\lbasi\\sample.pas', 'utf-8');
    const lexer: Lexer = new Lexer(sourceCode);
    const parser: Parser = new Parser(lexer);
    const interpreter: Interpreter = new Interpreter(parser);
    interpreter.interpret();
}

main();