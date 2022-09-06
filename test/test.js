// test/auth.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');
const app = require('../index');

const should = chai.should();

chai.use(chaiHttp);

// Agent that will keep track of our cookies
const agent = chai.request.agent(app);

const User = require('../app/models/User');

describe('User', function () {
    it('should not be able to login if they have not registered', function (done) {
        agent.post('/api/login', { email: 'wrong@example.com', password: 'nope' }).end(function (err, res) {
          res.should.have.status(404);
          done();
        });
      });

    // signup
//     it('should be able to signup', function (done) {
//         User.findOneAndRemove({ name: 'testone S' }, function() {
//         agent
//             .post('/api/sign-up')
//             .send({ firstName: 'testone',lastName: 'S', emailAddress: 'test@mailsac.com', password: 'password' })
//             .end(function (err, res) {
//             console.log(res.body);
//             res.should.have.status(200);
//             done();
//             });
//         });
//     });

});

after(function () {
    agent.close();
});