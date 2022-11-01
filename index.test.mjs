import { compile, bind, transform } from './index.mjs' ;



test('No.1 basic', ()=>{
  const result = transform({query:'select * from hello where id=$id', params:{ id: "foo" }});
  expect( result.transformedQuery    ).toBe( 'select * from hello where id=$1' );
  expect( result.positionalParams ).toStrictEqual( ['foo'] );
});

test( 'No.2 basic; positional parameters will be transparently processed to the exactry same parameters', ()=>{
  const result = transform({query:'select * from hello where id=$1', params:[ "foo" ]});
  expect( result.transformedQuery ).toBe( 'select * from hello where id=$1' );
  expect( result.positionalParams ).toStrictEqual( ['foo'] );
});

