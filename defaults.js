window.REST_API_TEST_DEFAULTS = {
	"GET /objects": {
		
	},
	"QUERY GET /objects": {
		"page": 1,
		"limit": 5
	},
	"POST /objects": {
        "name": "Apple MacBook Pro 16",
        "data": {
           "year": 2019,
           "price": 1849.99,
           "CPU model": "Intel Core i9",
           "Hard disk size": "1 TB"
        }
     },
	"QUERY POST /objects": {
		"debug": true
	}
}; 