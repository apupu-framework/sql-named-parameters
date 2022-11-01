
const checkNamedParam = ( params )=>{
  if ( params == null ) {
    return {};
  } else if ( Array.isArray( params ) ) {
    // add null before everything; the numbers in the parameter start from
    // one while the index numbers are zero-based numbers. 
    // 20221018172852
    // (Tue, 18 Oct 2022 17:25:31 +0900)
    //              vvvv
    return [ null, ...params ];
  } else {
    return params;
  }
};

const compile = ({ query, params })=>{
  const namedParams = checkNamedParam( params );

  /*
   * i2k ... index to key (an array  )
   *
   * Note that the value 'zero' is a dummy value. SQL parameter index number is
   * one-based index number; in order to avoid additional calculation, we
   * decided to add a dummy value to the storing array to shift its index
   * numbers by one.
   */
  const i2k = ['zero'];

  /*
   * k2i ... key to index ( an object )
   * a dictionary which convert keys to their corresponding indices.
   */
  const k2i  = {};

  const compiledQuery = query.replace( /\$([a-zA-Z0-9_]+)/g, function(s,m1) {
    const key = m1;
    if ( Object.hasOwn( k2i, key ) ) { 
      const indexNumber = k2i[ key ];
      return '$' + indexNumber;
    } else {
      const indexNumber = i2k.length;
      i2k.push( key );
      k2i[ key ] = indexNumber;
      return '$' + indexNumber;
    }
  });

  return { compiledQuery, i2k, k2i };
};

const bind = ({compiledQuery, i2k, k2i, params})=>{
  const namedParams = checkNamedParam( params );

  const positionalParams = [];
  //    vvvvvvv Note that this skips the first element; see the comment above.
  for ( let i=1; i< i2k.length; i++ ) {
    // console.log( 'i2k[i] in namedParams' , i2k[i] in namedParams  );
    if ( ! ( i2k[i] in namedParams ) ) {
      throw new ReferenceError({ message : `the query requires '${inspect(i2k[i])}' to bind, but no such key was supplied in the argument in \n${ inspect(namedParams) }` });
    }

    positionalParams.push( namedParams[ i2k[i] ] );
  }
  return { positionalParams };
};

const transform = ({query,params})=>{
  const  { compiledQuery,   i2k, k2i       } = compile({         query,           params });
  const  { positionalParams                } = bind   ({ compiledQuery, i2k, k2i, params });
  return { 
    query            : compiledQuery, 
    params           : positionalParams,
    transformedQuery : compiledQuery, 
    positionalParams : positionalParams 
  };
};

