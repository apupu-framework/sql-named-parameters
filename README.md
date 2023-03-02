
 sql-named-parameters
================================================================================

This non-opinionated library transforms named parameters into traditional
positional parameters.

```JavaScript
  const result = transform({
    query:'select * from hello where id=$id', 
    params:{ id: "foo" }
  });
  console.log( result.transformedQuery ); //  'select * from hello where id=$1'
  console.log( result.positionalParams ); // [ 'foo' ]
```

For those who want to save your precious finger power,

```JavaScript
  const result = transform({
    query:'select * from hello where id=$id',
    params:{ id: "foo" }
  });
  console.log( result.query  ); //  'select * from hello where id=$1'
  console.log( result.params ); // [ 'foo' ]
```


 About Binding `DEFAULT` as a Parameter
--------------------------------------------------------------------------------
Suppose there is a table as such :

```SQL
CREATE TABLE foos (
  foo_id   uuid    DEFAULT gen_random_uuid() NOT NULL
 ,foo_name varchar DEFAULT 'Mr.FOO' NOT NULL
 ,PRIMARY KEY ( foo_id )
)
```

Then, you want to insert rows :

```JavaScript
const conn  = db.connect();
const exec =({query,params})=>{
  const q = transform({query, params});
  conn.query(q.query, q.params);
};
const query=`
    INSERT INTO foos (  foo_name )
    VALUES           ( $foo_name )`;

exec({query, params:{foo_name:'foo'}});
exec({query, params:{foo_name:'bar'}});
```

Then, sometimes you want to set the default value which is defined as 'Mr.FOO',
but unfortunately DEFAULT cannot be specified as a parameter value. 

```JavaScript
exec({query, params:{foo_name:'baz'}});
exec({query, params:{foo_name:DEFAULT}}); // bummer, you cannot do that.
```

That's where this library comes in.

```JavaScript
  const result = transform({
    query:'INSERT INTO foos (foo_name) VALUES ($foo_name)', 
    params:{ foo_name : Symbol.for('DEFAULT') }
  });

  console.log( result.query  ); // 'INSERT INTO foos (foo_name) VALUES ( DEFAULT )'
  console.log( result.params ); // [ ]
```

 Variable Names with Any Dollar Signs in Themself
--------------------------------------------------------------------------------
While this library regards any word starts with a dollar sign as a variable
name, it will exclude those in which there are any dollar signs in the
middle/in the end of itself.

This feature is intended to pass PostgreSQL's dollar-quoted string constants.

```SQL
  const result = transform({
    query:
    `
      CREATE OR REPLACE FUNCTION test_func() RETURNS uuid AS
      $SQL$
      BEGIN
        RETURN gen_random_uuid();
      END
      $SQL$ LANGUAGE plpgsql;
    `,
    params: []
  });
  console.error( result.transformedQuery );

>      CREATE OR REPLACE FUNCTION test_func() RETURNS uuid AS
>      $SQL$
>      BEGIN
>        RETURN gen_random_uuid();
>      END
>      $SQL$ LANGUAGE plpgsql;
```


 About Escape Sequence `$$`
--------------------------------------------------------------------------------
#### This function is deprecated ####
This function is deprecated; all newly started projects should not use this feature.
As of Mar 2 2023, PostgreSQL's dollar-quoted strings are safely ignored. This feature
is not necessary anymore.

#### Description ####
Double dollar `$$` will be replaced with `$`

```SQL
  const result = transform({
    query:
    `
      CREATE OR REPLACE FUNCTION test_func() RETURNS uuid AS
      $$SQL$$
      BEGIN
        RETURN gen_random_uuid();
      END
      $$SQL$$ LANGUAGE plpgsql;
    `,
    params: []
  });
  console.error( result.transformedQuery );

>      CREATE OR REPLACE FUNCTION test_func() RETURNS uuid AS
>      $SQL$
>      BEGIN
>        RETURN gen_random_uuid();
>      END
>      $SQL$ LANGUAGE plpgsql;
```


 CAUTION
--------------------------------------------------------------------------------
This library is a kind of SQL generator. Any libraries that generate SQL are
inherently vulnerable for SQL injection. For me, it seems safe enough to use in
production; but you cannot believe me especially if you are using this in a
system at a nuclear plant, a serious banking system or something you think it
is precious.

IF YOU DON'T KNOW WHAT YOU ARE DOING, THEN DON'T USE THIS LIBRARY. 

You are warned.

Otherwise, this library may be going to work well and reduce size of your code.


 History
--------------------------------------------------------------------------------
- 0.1.0 : The first version.
- 0.1.1 : Supported `DEFAULT`.
- 0.1.2 : Updated the document.
- 0.1.3 : Updated the document.
- 0.1.4 : Throw more informative error messages. (Mon, 07 Nov 2022 18:43:17 +0900)
- 0.1.5 : Added escape sequence `$$`. (Fri, 09 Dec 2022 18:54:53 +0900)
- 1.0.6 : All variable names contains any dollar signs should be ignored
          (Thu, 02 Mar 2023 13:58:55 +0900)


 Conclusion
--------------------------------------------------------------------------------
That's all. Thank you very much for your kind attention.


