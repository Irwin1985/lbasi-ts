BEGIN
    BEGIN
        number := 2;
        a := number;
        WRITELN(a);
        b := 10 * a + 10 * number / 4;
        WRITELN(b);
        c := a - - b;
        WRITELN(c);
    END;
    x := 11;
    WRITELN(x);
END.