
 sql-named-parameters
================================================================================

This non-opinionated library transforms named parameters into traditional
positional parameters.

```JavaScript
  const result = transform({query:'select * from hello where id=$id', params:{ id: "foo" }});
  console.log( result.transformedQuery ); //  'select * from hello where id=$1'
  console.log( result.positionalParams ); // [ 'foo' ]
```

For those want to save your precious finger power,

```JavaScript
  const result = transform({query:'select * from hello where id=$id', params:{ id: "foo" }});
  console.log( result.query  ); //  'select * from hello where id=$1'
  console.log( result.params ); // [ 'foo' ]
```



 History
--------------------------------------------------------------------------------
- 0.1.0 :  The first version.


