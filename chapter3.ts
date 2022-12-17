//// Part 3: full arithmethic calculator

//const prompt = require('prompt-sync')();

//enum TokenType {
//    INTEGER = 'INTEGER',
//    PLUS = 'PLUS',
//    MINUS = 'MINUS',
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

//class Interpreter {
//    text: string;
//    pos: number;
//    currentChar: string;
//    currentToken: Token;

//    constructor(text: string) {
//        this.text = text;
//        this.pos = 0;
//        this.currentChar = this.text[this.pos]; // prime character
//        this.currentToken = null;
//    }

//    error(): never {
//        throw new SyntaxError('Invalid sintax');
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
//            this.error(); // SyntaxError
//        }
//        return new Token(TokenType.EOF, null);
//    }

//    eat(t: TokenType) {
//        if (this.currentToken.type === t) {
//            this.currentToken = this.getNextToken();
//        } else {
//            this.error();
//        }
//    }
//    // term ::= INTEGER
//    term(): number {
//        const token: Token = this.currentToken;
//        this.eat(TokenType.INTEGER);
//        return token.value;
//    }

//    // expr ::= term (('+'|'-' term)*
//    expr(): number {
//        this.currentToken = this.getNextToken();
//        var result: number = this.term();
//        while ([TokenType.PLUS, TokenType.MINUS].includes(this.currentToken.type)) {
//            if (this.currentToken.type === TokenType.PLUS) {
//                this.eat(TokenType.PLUS);
//                result += this.term();
//            } else {
//                this.eat(TokenType.MINUS);
//                result -= this.term();
//            }
//        }
//        return result;
//    }

//    isSpace(c: string): boolean {
//        return c === ' ' || c === '\t' || c === '\r' || c === '\n';
//    }

//    isDigit(c: string): boolean {
//        return '0' <= c && c <= '9';
//    }

//    isAtEnd(): boolean {
//        return this.pos >= this.text.length;
//    }
//}

//function main() {
//    while (true) {
//        const line = String(prompt('calc> '));
//        if (line.length == 0) break;
//        const interpreter: Interpreter = new Interpreter(line);
//        const result = interpreter.expr();
//        console.log(result);
//    }
//}

//main();