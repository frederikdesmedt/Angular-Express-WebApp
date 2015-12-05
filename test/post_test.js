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
			postId = post._id;
			expect(post).to.have.all.keys('__v', '_id', 'comments', 'upvotes', 'link', 'title', 'author');
			expect(post.comments).to.be.an('array');
			expect(post.upvotes).to.be.a('array');
			done();
		});
	});
});

var post = 'post';
var put = 'put';
var get = 'get';

checkUrlForStatus(post, '/posts', 401, 'when not logged in');
checkUrlForStatus(put, '/posts/1/upvote', 401, 'when not logged in and using invalid mongo id');
checkUrlForStatus(put, '/posts/1/downvote', 401, 'when not logged in and using invalid mongo id');
checkUrlForStatus(put, '/comments/1/upvote', 401, 'when not logged in and using invalid mongo id');
checkUrlForStatus(put, '/comments/1/downvote', 401, 'when not logged in and using invalid mongo id');
checkUrlForStatus(post, '/login', 400, 'when sending no data');
checkUrlForStatus(post, '/register', 400, 'when sending no data');
checkUrlForJson(post, '/login', 'should tell there are missing fields when sending no data', { missingFields: true });
checkUrlForJson(post, '/register', 'should tell there are missing fields when sending no data', { missingFields: true });

function checkUrlForStatus(method, url, status, when, json) {
	describe(method.toUpperCase() + ' ' + url, function () {
		it('should respond with ' + status + ' ' + when, function (done) {
			agent[method](url).send(JSON.stringify(json || {})).expect(status, done);
		});
	});
}

function checkUrlForStatusAndLog(method, url, status, when, json) {
	describe(method.toUpperCase() + ' ' + url, function () {
		it('should respond with ' + status + ' ' + when, function (done) {
			agent[method](url).send(JSON.stringify(json || {})).end(function (err, res) {
				console.log(res);
				if (err) { return done(err); }
			});
		});
	});
}

function checkUrlForJson(method, url, should, receive, send) {
	describe(method.toUpperCase() + ' ' + url, function () {
		it(should, function (done) {
			agent[method](url).send(JSON.stringify(send || {})).end(function (err, res) {
				if (err) { return done(err); }
				expect(res.body).to.deep.equal(receive);
				done();
			});
		});
	});
}