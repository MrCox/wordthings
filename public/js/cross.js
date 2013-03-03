function random_nums(fieldset) {
    var randoms = crossfilter([])

				for (var k=0; k < Math.ceil(Math.random() * 501); k ++) {
        var values = {}
				    for (var i=0; i < fieldset.length; i++) {
				        values[ fieldset[i] ] = Math.ceil(Math.random() * 1001)
				    }
				    randoms.add([values])
    }
				return randoms
}

function random_fields() {
    var letters = ['a','b','c','d','e','f','g','h','i','j',
				    'k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
								fields = []
    for (var i=0; i < Math.ceil(Math.random() * 101); i++ ) {
								fieldname = ''
				    for( var j = 0; j < Math.ceil(Math.random() * 16); j++) {
								    fieldname += letters[ Math.ceil(Math.random() * 27) ]
								}
								fields.push( fieldname )
				}
				return	fields
}

var fields = random_fields(),
    randoms = random_nums(fields),

				fieldNames = randoms.dimension( function(d) {
        keys = []
        for (var key in d) { keys.push(key) }
        return keys 
				}).group().all()[0].key,
    
    records = {}
    for (var i=0; i<fieldNames.length; i++) {
        records[ fieldNames[i] ] = randoms.dimension( function(d) {
            return d[ fieldNames[i] ]}).top(Infinity) 
				}

var max_min =[] 
for ( var key in records ) {
				data = []
				data.push( records[key][0][key] )
				data.push( records[key][ records[key].length - 1 ][key] )
				max_min.push( data )
}

