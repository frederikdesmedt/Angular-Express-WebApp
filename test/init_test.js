var expect = require('chai').expect;

describe('Init', function() {
	it('starts a new testing environment', function(done) {
		expect('test').to.equal('test');
		done();
	});
});