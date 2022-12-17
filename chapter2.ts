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
//    currentToken: Token;
//    currentChar: string;

//    constructor(text: string) {
//        this.text = text;
//        this.pos = 0;
//        this.currentChar = this.text[this.pos]; // prime the character
//        this.currentToken = null;
//    }

//    error(): never {
//        throw new SyntaxError('Error parsing input');
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
//        while (this.currentChar !== null && this.isSpace(this.currentChar)) {
//            this.advance();
//        }
//    }

//    integer(): number {
//        var result: string = '';
//        while (!this.isAtEnd() && this.isDigit(this.currentChar)) {
//            result += this.currentChar;
//            this.advance();
//        }
//        return Number(result);
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
//            this.error();
//        }
//        return new Token(TokenType.EOF, null);
//    }

//    eat(t: TokenType) {
//        if (this.currentToken.type == t) {
//            this.currentToken = this.getNextToken();
//        } else {
//            this.error();
//        }
//    }

//    expr(): number {
//        this.currentToken = this.getNextToken();
//        const left: Token = this.currentToken;
//        this.eat(TokenType.INTEGER);
//        const op: Token = this.currentToken;
//        if (op.type === TokenType.PLUS) {
//            this.eat(TokenType.PLUS);
//        } else {
//            this.eat(TokenType.MINUS);
//        }
//        const right: Token = this.currentToken;
//        this.eat(TokenType.INTEGER);

//        // Performs the arithmetic
//        if (op.type === TokenType.PLUS) {
//            return Number(left.value) + Number(right.value);
//        } else {
//            return Number(left.value) - Number(right.value);
//        }
//    }

//    isAtEnd(): boolean {
//        return this.pos >= this.text.length;
//    }

//    isSpace(c: string): boolean {
//        return c === ' ' || c === '\r' || c === '\t' || c === '\n';
//    }

//    isDigit(c: string): boolean {
//        return '0' <= c && c <= '9';
//    }
//}

//function main() {
//    while (true) {
//        const line = String(prompt('calc> '));
//        if (line.length === 0) continue;
//        const interpreter: Interpreter = new Interpreter(line);
//        const result: number = interpreter.expr();
//        console.log(result);
//    }
//}

//main();