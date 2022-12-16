const prompt = require('prompt-sync')();

enum TokenType {
    INTEGER = 'INTEGER',
    PLUS = 'PLUS',
    EOF = 'EOF',
}

class Token {
    type: TokenType;
    value: Number;

    constructor(type: TokenType, value: any) {
        this.type = type;
        this.value = value;
    }

    public toString(): string {
        return `Token(${this.type}, ${this.value})`;
    }
}

class Interpreter {
    text: string;
    pos: number;
    currentToken: Token;

    constructor(text: string) {
        this.text = text;
        this.pos = 0;
        this.currentToken = null;
    }

    error() : never {
        throw new SyntaxError('Error parsing input.');
    }

    getNextToken(): Token {
        var text = this.text;
        if (this.pos >= text.length) {
            return new Token(TokenType.EOF, null);
        }
        var currentChar: String = text[this.pos];

        if (this.isDigit(currentChar)) {
            var token: Token = new Token(TokenType.INTEGER, Number(currentChar));
            this.pos++;
            return token;
        }
        if (currentChar === '+') {
            var token: Token = new Token(TokenType.PLUS, currentChar);
            this.pos++;
            return token;
        }
        this.error();
    }

    eat(type: TokenType) {
        if (this.currentToken.type === type) {
            this.currentToken = this.getNextToken();
        } else {
            this.error();
        }
    }

    expr(): Number {
        this.currentToken = this.getNextToken();
        var left: Token = this.currentToken;
        this.eat(TokenType.INTEGER);

        var op: Token = this.currentToken;
        this.eat(TokenType.PLUS);

        var right: Token = this.currentToken;
        this.eat(TokenType.INTEGER);

        var result: number = Number(left.value) + Number(right.value);

        return result;
    }

    isDigit(c: String): boolean {
        return '0' <= c && c <= '9';
    }
}

function main() {
    while (true) {
        var line = String(prompt('calc> '));
        if (line.endsWith('\n')) {
            line = line.substring(0, -1);
        }
        var interpreter: Interpreter = new Interpreter(line);
        var result: Number = interpreter.expr();
        console.log(result);        
    }
}

main();