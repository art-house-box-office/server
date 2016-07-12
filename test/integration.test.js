import '../src/lib/setup-dotenv';
import '../src/lib/setup-mongoose';
import app from '../src/lib/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import User from '../src/models/user';
import token from '../src/lib/token';
const assert = chai.assert;
chai.use(chaiHttp);

const theaterTestData = {
  name: 'test',
  seats: 30,
};

const testAdmin = {
  username: 'testAdmin',
  password: 'chai',
};

const testUser1 = {
  username: 'testUser1',
  password: 'test1',
};

const testUser2 = {
  username: 'testUser2',
  password: 'test2',
};

const request = chai.request(app);

describe('integration', function () {
  describe('User creation', function () {
    before('create testAdmin user', function (done) {
      this.timeout(10000);
      const adminUser = new User(testAdmin);
      adminUser.generateHash(adminUser.password);
      adminUser.roles.push('admin');
      return adminUser.save()
        .then(newUser => {
          token.sign(newUser);
          testAdmin.id = newUser.id;
          done();
        });
    });

    before('get token for testAdmin', function (done) {
      this.timeout(10000);
      request
      .post('/api/signin')
      .send(testAdmin)
      .end((err, res) => {
        const result = JSON.parse(res.text);
        testAdmin.token = result.returnedToken;
        done();
      });
    });

    it('create testUser1', function (done) {
      this.timeout(10000);
      request
        .post('/api/signup')
        .send(testUser1)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.property(result, 'returnedToken');
          assert.property(result, 'id');
          testUser1.token = result.returnedToken;
          testUser1.id = result.id;
          done();
        });
    });
    it('create testUser2', function (done) {
      this.timeout(10000);
      request
        .post('/api/signup')
        .send(testUser2)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.property(result, 'returnedToken');
          assert.property(result, 'id');
          testUser2.token = result.returnedToken;
          testUser2.id = result.id;
          done();
        });
    });

    it('set testUser1 as admin', function (done) {
      this.timeout(10000);
      request
      .post(`/api/users/${testUser1.id}/roles/admin`)
      .set('authorization', `Bearer ${testAdmin.token}`)
      .end((err, res) => {
        request
          .post('/api/signin')
          .send(testUser1)
          .end((err, res) => {
            const result = JSON.parse(res.text);
            testUser1.token = result.returnedToken;
            done();
          });
      });
    });
  });


  describe('Theater endpoint', () => {
    it('POST to /api/theaters completes with id', done => {
      request
        .post('/api/theaters')
        .set('authorization', `Bearer ${testAdmin.token}`)
        .send(theaterTestData)
        .end((err, res) => {
          // console.log(res);
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          theaterTestData.id = result._id;
          assert.property(result, '_id');
          assert.propertyVal(result, 'name', theaterTestData.name);
          done();
        });
    });
  });

  after('delete testuser1', function (done) {
    this.timeout(10000);
    request
    .delete(`/api/users/${testUser1.id}`)
    .set('authorization', `Bearer ${testAdmin.token}`)
    .end((err, res) => {
      done();
    });
  });

  after('delete testuser2', function (done) {
    this.timeout(10000);
    request
    .delete(`/api/users/${testUser2.id}`)
    .set('authorization', `Bearer ${testAdmin.token}`)
    .end((err, res) => {
      done();
    });
  });

  after('delete testAdmin', function (done) {
    this.timeout(10000);
    request
    .delete(`/api/users/${testAdmin.id}`)
    .set('authorization', `Bearer ${testAdmin.token}`)
    .end((err, res) => {
      done();
    });
  });

});
