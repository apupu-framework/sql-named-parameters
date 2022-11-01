params: body
'use strict'

const util = require('util');
function inspect(s) {
  return util.inspect( s, {
    depth:null,
    // colors:true,
  });
}

<%=body %>

module.exports.compile    = compile;
module.exports.bind       = bind;
module.exports.transform  = transform;

