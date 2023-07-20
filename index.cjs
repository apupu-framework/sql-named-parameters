'use strict'

const util = require('util');
function inspect(s) {
  return util.inspect( s, {
    depth:null,
    // colors:true,
  });
}


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

const CONST_DOLLAR_SIGN = '__CONST_DOLLAR_SIGN_ESCAPE_SEQUENCE_CONST__';

const compile = ({ query, params })=>{
  // replaceAll() to escape sequence `$$`; added on (Fri, 09 Dec 2022 18:47:14 +0900)
  query = query.replaceAll( '$$', CONST_DOLLAR_SIGN );

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


  /*
   * The interned symbol to be interpolated as a SQL reserved word `DEFAULT`
   * that should be treated as the default value in UPDATE/INSERT clause.
   */
  const DEFAULT = Symbol.for('DEFAULT');

  const compiledQuery = query.replace( /\$([a-zA-Z0-9_$]+)/g, function(s,m1) {
    // ADDED ON (Thu, 02 Mar 2023 13:31:36 +0900)
    // If there are any dollar signs in the middle of the matched string, pass it through.
    if ( 0<=m1.indexOf('$') ) {
      return s;
    }

    const key = m1;
    if ( Object.hasOwn( k2i, key ) ) {
      const indexNumber = k2i[ key ];
      if ( indexNumber === DEFAULT ) {
        return 'DEFAULT';
      } else {
        return '$' + indexNumber;
      }
    } else {
      if ((key in namedParams ) && ( namedParams[key] === DEFAULT)  ) {
        k2i[ key ] = DEFAULT;
        return 'DEFAULT';
      } else {
        const indexNumber = i2k.length;
        i2k.push( key );
        k2i[ key ] = indexNumber;
        return '$' + indexNumber;
      }
    }
  }).replaceAll( CONST_DOLLAR_SIGN, '$$' );

  // ^^^ replaceAll() to escape sequence `$$`; added on (Fri, 09 Dec 2022 18:47:14 +0900)

  return { compiledQuery, i2k, k2i };
};

const bind = ({query, compiledQuery, i2k, k2i, params})=>{
  const namedParams = checkNamedParam( params );

  const positionalParams = [];
  //    vvvvvvv Note that this skips the first element; see the comment above.
  for ( let i=1; i< i2k.length; i++ ) {
    // console.log( 'i2k[i] in namedParams' , i2k[i] in namedParams  );
    if ( ! ( i2k[i] in namedParams ) ) {
      throw new ReferenceError(`the query requires '${inspect(i2k[i])}' to bind, but no such key was supplied in the argument in \n${ inspect(namedParams) }.\n\nquery:\n${query}\n` );
    }

    positionalParams.push( namedParams[ i2k[i] ] );
  }
  return { positionalParams };
};

const transform = ({query,params})=>{
  const  { compiledQuery,   i2k, k2i       } = compile({ query,                          params });
  const  { positionalParams                } = bind   ({ query, compiledQuery, i2k, k2i, params });
  return {
    query            : compiledQuery,
    params           : positionalParams,
    transformedQuery : compiledQuery,
    positionalParams : positionalParams
  };
};



module.exports.compile    = compile;
module.exports.bind       = bind;
module.exports.transform  = transform;