//const prompt = require('prompt-sync')();
//enum TokenType {
//    INTEGER = 'INTEGER',
//    PLUS = 'PLUS',
//    MINUS = 'MINUS',
//    MUL = 'MUL',
//    DIV = 'DIV',
//    EOF = 'EOF',
//}
//class Token {
//    type: TokenType;
//    value: any;
//    constructor(type: TokenType, value: any) {
//        this.type = type;
//        this.value = value;
//    }
//}
//class Lexer {
//    text: string;
//    pos: number;
//    currentChar: string;
//    constructor(text: string) {
//        this.text = text;
//        this.pos = 0;
//        this.currentChar = this.text[this.pos]; // prime character
//    }
//    error(): never {
//        throw new SyntaxError('Invalid character.');
//    }
//    advance() {
//        this.pos++;
//        if (this.pos >= this.text.length) {
//            this.currentChar = null;
//        } else {
//            this.currentChar = this.text[this.pos];
//        }
//    }
//    skipWhitespace() {
//        while (!this.isAtEnd() && this.isSpace(this.currentChar)) {
//            this.advance();
//        }
//    }
//    integer(): number {
//        var lexeme = '';
//        while (!this.isAtEnd() && this.isDigit(this.currentChar)) {
//            lexeme += this.currentChar;
//            this.advance();
//        }
//        return Number(lexeme);
//    }
//    getNextToken(): Token {
//        while (!this.isAtEnd()) {
//            if (this.isSpace(this.currentChar)) {
//                this.skipWhitespace();
//                continue;
//            }
//            if (this.isDigit(this.currentChar)) {
//                return new Token(TokenType.INTEGER, this.integer());
//            }
//            if (this.currentChar === '+') {
//                this.advance();
//                return new Token(TokenType.PLUS, '+');
//            }
//            if (this.currentChar === '-') {
//                this.advance();
//                return new Token(TokenType.MINUS, '-');
//            }
//            if (this.currentChar === '*') {
//                this.advance();
//                return new Token(TokenType.MUL, '*');
//            }
//            if (this.currentChar === '/') {
//                this.advance();
//                return new Token(TokenType.DIV, '/');
//            }
//            this.error(); // unknown character.
//        }
//        return new Token(TokenType.EOF, null);
//    }
//    isAtEnd(): boolean {
//        return this.pos >= this.text.length;
//    }
//    isSpace(c: string): boolean {
//        return c === ' ' || c === '\t' || c === '\r' || c === '\n';
//    }
//    isDigit(c: string): boolean {
//        return '0' <= c && c <= '9';
//    }
//}
//class Interpreter {
//    lexer: Lexer;
//    currentToken: Token;
//    constructor(lexer: Lexer) {
//        this.lexer = lexer;
//        this.currentToken = this.lexer.getNextToken();
//    }
//    error(): never {
//        throw new SyntaxError('Invalid syntax');
//    }
//    eat(t: TokenType) {
//        if (this.currentToken.type == t) {
//            this.currentToken = this.lexer.getNextToken();
//        } else {
//            this.error();
//        }
//    }
//    // factor ::= INTEGER;
//    factor(): number {
//        const token = this.currentToken;
//        this.eat(TokenType.INTEGER);
//        return token.value;
//    }
//    // term ::= factor ('*'|'/' factor)*
//    term(): number {
//        var result: number = this.factor();
//        while ([TokenType.MUL, TokenType.DIV].includes(this.currentToken.type)) {
//            if (this.currentToken.type == TokenType.MUL) {
//                this.eat(TokenType.MUL);
//                result *= this.factor();
//            } else {
//                this.eat(TokenType.DIV);
//                result /= this.factor();
//            }
//        }
//        return result;
//    }
//    // expr ::= term ('+'|'-' term)*
//    expr(): number {
//        var result: number = this.term();
//        while ([TokenType.PLUS, TokenType.MINUS].includes(this.currentToken.type)) {
//            if (this.currentToken.type == TokenType.PLUS) {
//                this.eat(TokenType.PLUS);
//                result += this.term();
//            } else {
//                this.eat(TokenType.MINUS);
//                result -= this.term();
//            }
//        }
//        return result;
//    }
//}
//function main() {
//    while (true) {
//        const line = String(prompt('calc> '));
//        if (line.length == 0) break;
//        const lexer: Lexer = new Lexer(line);
//        const interpreter: Interpreter = new Interpreter(lexer);
//        const result = interpreter.expr();
//        console.log(result);
//    }
//}
//main();
//# sourceMappingURL=chapter4.js.map