var expect = require('chai').expect;
var app = require('../app');
var request = require('supertest');

var agent = request.agent(app);

describe('GET /posts', function () {
	it('should respond with 200 in case of a valid request', function (done) {
		agent.get('/posts').send().end(function (err, res) {
			if (err) { return done(err); }
			var fetchedData = res.body;
			expect(fetchedData).to.be.an('array');
			expect(fetchedData).to.be.not.empty;
			var post = fetchedData[0];

			expect(post).to.have.all.keys('__v', '_id', 'comments', 'upvotes', 'link', 'title', 'author');
			expect(post.comments).to.be.an('array');
			expect(post.upvotes).to.be.a('array');
			done();
		});
	});
});

var authorizedPostUrls = ['/posts', '/posts/123/comment'];
var authorizedPutUrls = ['/posts/123/upvote', '/posts/123/downvote', '/comments/123/upvote', '/comments/123/downvote'];

authorizedPostUrls.forEach(function (url) {
	checkUrlAuthorization('POST', url);
});

authorizedPutUrls.forEach(function (url) {
	checkUrlAuthorization('PUT', url);
});

function checkUrlAuthorization(method, url) {
	describe(method + ' ' + url, function () {
		it('should respond with 401, denying access', function (done) {
			agent.post('/posts').send({
				// shouldn't matter what you send
			}).expect(401);
			done();
		});
	});
}