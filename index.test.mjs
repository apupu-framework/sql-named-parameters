import { compile, bind, transform } from './index.mjs' ;


const DEFAULT = Symbol.for('DEFAULT');

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

test( 'No.3 DEFAULT', ()=>{
  const result = transform({query:'select * from hello where id=$id_foo', params:{ id_foo: DEFAULT }});
  expect( result.transformedQuery ).toBe( 'select * from hello where id=DEFAULT' );
  expect( result.positionalParams ).toStrictEqual( [] );
});

test( 'No.4 multiple columns', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col4, $col5 )`,
    params:{ 
      col1: 'col1',
      col2: 'col2',
      col3: 'col3',
      col4: 'col4',
      col5: 'col5',
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $1, $2, $3, $4, $5 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
  ] );
});

test( 'No.5 multiple columns with DEFAULT part1', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col4, $col5 )`,
    params:{ 
      col1: DEFAULT,
      col2: 'col2',
      col3: 'col3',
      col4: 'col4',
      col5: 'col5',
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( DEFAULT, $1, $2, $3, $4 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col2',
    'col3',
    'col4',
    'col5',
  ] );
});


test( 'No.6 multiple columns with DEFAULT part2', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col4, $col5 )`,
    params:{ 
      col1: 'col1',
      col2: 'col2',
      col3: 'col3',
      col4: 'col4',
      col5: DEFAULT,
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $1, $2, $3, $4, DEFAULT )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col1',
    'col2',
    'col3',
    'col4',
  ] );
});

test( 'No.7 multiple columns with DEFAULT part3', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col4, $col5 )`,
    params:{ 
      col1: 'col1',
      col2: 'col2',
      col3: DEFAULT,
      col4: 'col4',
      col5: 'col5',
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $1, $2, DEFAULT, $3, $4 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col1',
    'col2',
    'col4',
    'col5',
  ] );
});


test( 'No.8 multiple columns with two DEFAULT values', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col4, $col5 )`,
    params:{ 
      col1: 'col1',
      col2: DEFAULT,
      col3: DEFAULT,
      col4: 'col4',
      col5: 'col5',
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $1, DEFAULT, DEFAULT, $2, $3 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col1',
    'col4',
    'col5',
  ] );
});




test( 'No.9 multiple columns with all DEFAULT values', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col4, $col5 )`,
    params:{ 
      col1: DEFAULT,
      col2: DEFAULT,
      col3: DEFAULT,
      col4: DEFAULT,
      col5: DEFAULT,
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
  ] );
});


test( 'No.10 multiple columns with back reference', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col1, $col5 )`,
    params:{ 
      col1: 'col1',
      col2: 'col2',
      col3: 'col3',
      col5: 'col5',
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $1, $2, $3, $1, $4 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col1',
    'col2',
    'col3',
    'col5',
  ] );
});




test( 'No.11 multiple columns with back reference with DEFAULT part1', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col1, $col5 )`,
    params:{ 
      col1: DEFAULT,
      col2: 'col2',
      col3: 'col3',
      col5: 'col5',
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( DEFAULT, $1, $2, DEFAULT, $3 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col2',
    'col3',
    'col5',
  ] );
});




test( 'No.12 multiple columns with back reference with DEFAULT part2', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col1, $col5 )`,
    params:{ 
      col1: 'col1',
      col2: 'col2',
      col3: 'col3',
      col5: DEFAULT,
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $1, $2, $3, $1, DEFAULT )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col1',
    'col2',
    'col3',
  ] );
});


test( 'No.13 multiple columns with back reference with DEFAULT part3', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $col1, $col2, $col3, $col1, $col5 )`,
    params:{ 
      col1: 'col1',
      col2: 'col2',
      col3: DEFAULT,
      col5: 'col5',
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col1,  col2 , col3,  col4,  col5 )
      VALUES               ( $1, $2, DEFAULT, $1, $3 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col1',
    'col2',
    'col5',
  ] );
});


test( 'No.14 ten columns', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $col01, $col02, $col03, $col04, $col05, $col06, $col07, $col08, $col09, $col10 )`,
    params:{
      col01: 'col01',
      col02: 'col02',
      col03: 'col03',
      col04: 'col04',
      col05: 'col05',
      col06: 'col06',
      col07: 'col07',
      col08: 'col08',
      col09: 'col09',
      col10: 'col10',
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col01',
    'col02',
    'col03',
    'col04',
    'col05',
    'col06',
    'col07',
    'col08',
    'col09',
    'col10',
  ] );
});


test( 'No.15 ten columns', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $col01, $col02, $col03, $col04, $col05, $col05, $col04, $col03, $col02, $col01 )`,
    params:{
      col01: 'col01',
      col02: 'col02',
      col03: 'col03',
      col04: 'col04',
      col05: 'col05',
      col06: 'col06',
      col07: 'col07',
      col08: 'col08',
      col09: 'col09',
      col10: 'col10',
    }
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $1, $2, $3, $4, $5, $5, $4, $3, $2, $1 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col01',
    'col02',
    'col03',
    'col04',
    'col05',
  ] );
});


test( 'No.16 array part1', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $1, $2, $3, $4, $5, $5, $4, $3, $2, $1 )`,
    params: [
      'col01',
      'col02',
      'col03',
      'col04',
      'col05',
      'col06',
      'col07',
      'col08',
      'col09',
      'col10',
    ]
  });
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $1, $2, $3, $4, $5, $5, $4, $3, $2, $1 )` );

  console.error(result.transformedQuery);
  expect( result.positionalParams ).toStrictEqual( [
    'col01',
    'col02',
    'col03',
    'col04',
    'col05',
  ] );
});


test( 'No.17 array part2 - corner case 1', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $3, $4, $5, $6, $7, $8, $9, $10, $11, $12 )`,
    params: [
      null,
      null,
      'col01',
      'col02',
      'col03',
      'col04',
      'col05',
      'col06',
      'col07',
      'col08',
      'col09',
      'col10',
    ]
  });
  console.error(result.transformedQuery);
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )` );

  expect( result.positionalParams ).toStrictEqual( [
    'col01',
    'col02',
    'col03',
    'col04',
    'col05',
    'col06',
    'col07',
    'col08',
    'col09',
    'col10',
  ] );
});



test( 'No.18 array part3 - corner case 2', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $3, $4, $5, $6, $7, $8, $9, $10, $11, $12 )`,
    params: [
      null,
      null,
      'col01',
      'col02',
      'col03',
      'col04',
      DEFAULT,
      'col06',
      'col07',
      'col08',
      'col09',
      'col10',
    ]
  });
  console.error(result);
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $1, $2, $3, $4, DEFAULT, $5, $6, $7, $8, $9 )` );

  expect( result.positionalParams ).toStrictEqual( [
    'col01',
    'col02',
    'col03',
    'col04',
    'col06',
    'col07',
    'col08',
    'col09',
    'col10',
  ] );
});



test( 'No.19 array part4 - corner case 3 sparse', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $2, $4, $6, $8, $10, $12, $14, $16, $18, $20 )`,
    params: [
      null,
      'col01',
      null,
      'col02',
      null,
      'col03',
      null,
      'col04',
      null,
      'col05',
      null,
      'col06',
      null,
      'col07',
      null,
      'col08',
      null,
      'col09',
      null,
      'col10',
    ]
  });
  console.error(result);
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )` );

  expect( result.positionalParams ).toStrictEqual( [
    'col01',
    'col02',
    'col03',
    'col04',
    'col05',
    'col06',
    'col07',
    'col08',
    'col09',
    'col10',
  ] );
});



test( 'No.20 array part5 - corner case 4 sparse with DEFAULT', ()=>{
  const result = transform({
    query:
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $2, $4, $6, $8, $10, $12, $14, $16, $18, $20 )`,
    params: [
      null,
      'col01',
      null,
      'col02',
      null,
      'col03',
      null,
      'col04',
      null,
      DEFAULT,
      null,
      'col06',
      null,
      'col07',
      null,
      'col08',
      null,
      'col09',
      null,
      'col10',
    ]
  });
  console.error(result);
  expect( result.transformedQuery ).toBe(
    `
      INSERT INTO test_tbl (  col01,  col02,  col03,  col04,  col05,  col06,  col07,  col08,  col09,  col10 )
      VALUES               ( $1, $2, $3, $4, DEFAULT, $5, $6, $7, $8, $9 )` );

  expect( result.positionalParams ).toStrictEqual( [
    'col01',
    'col02',
    'col03',
    'col04',
    'col06',
    'col07',
    'col08',
    'col09',
    'col10',
  ] );
});



test( 'escape sequence 1', ()=>{
  const result = transform({
    query:
    `
      create or replace function test_func() RETURNS uuid as
      $$SQL$$
      begin
        RETURN gen_random_uuid();
      end
      $$SQL$$ LANGUAGE plpgsql;
    `,
    params: [
    ]
  });
  // console.error( result );
  expect( result.transformedQuery ).toBe(
    `
      create or replace function test_func() RETURNS uuid as
      $SQL$
      begin
        RETURN gen_random_uuid();
      end
      $SQL$ LANGUAGE plpgsql;
    `
  )
});

