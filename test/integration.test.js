import '../src/lib/setup-dotenv';
import '../src/lib/setup-mongoose';
import app from '../src/lib/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import User from '../src/models/user';
import token from '../src/lib/token';
const assert = chai.assert;
chai.use(chaiHttp);
const request = chai.request(app);

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

const mockTheater = {
  name: 'test',
  seats: 90,
};

const mockMovie = {
  key: 'foo',
  OMDbRef: 'bar',
};


describe('integration', function () {

  describe('user creation', function () {
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

  describe('theater endpoint', () => {
    const url = '/api/theaters';
    const testData = {
      name: 'test',
      seats: 30,
    };
    it(`POST to ${url} completes with id`, done => {
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id;
          assert.property(result, '_id');
          assert.propertyVal(result, 'name', testData.name);
          done();
        });
    });
    it(`GET to ${url}/:id shows new data`, done => {
      request
        .get(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          done();
        });
    });
    it(`PUT to ${url}/:id returns modified data`, done => {
      testData.name = 'newtest';
      request
        .put(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          assert.propertyVal(result, 'name', testData.name);
          done();
        });
    });
    it(`DELETE to ${url}/:id by unauthorized user fails`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not Authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });
    it(`DELETE to ${url}/:id by authorized user completes`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'resource with this id not found')
              done();
            });
        });
    });
  });

  describe('screenings endpoint', () => {
    const url = '/api/screenings';
    const testData = {
      attendanceTotal: 30,
      dateTime: new Date(),
      admissionsTotal: 400,
      seats: 30,
    };
    before('creating mock theater entry', function (done) {
      this.timeout(2000);
      request
      .post('/api/theaters')
      .set('authorization', `Bearer ${testUser1.token}`)
      .send(mockTheater)
      .end((err, res) => {
        if (err) return (done(err));
        const dtr = JSON.parse(res.text);
        testData.theater = dtr._id;
        mockTheater.id = dtr._id;
        done();
      });
    });

    before('creating mock movie entry', function (done) {
      this.timeout(2000);
      request
      .post('/api/movies')
      .set('authorization', `Bearer ${testUser1.token}`)
      .send(mockMovie)
      .end((err, res) => {
        if (err) return (done(err));
        const dmr = JSON.parse(res.text);
        mockMovie.id = dmr._id;
        testData.movie = dmr._id;
        done();
      });
    });

    it(`POST to ${url} completes with id`, done => {
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id;
          assert.property(result, '_id');
          assert.propertyVal(result, 'seats', testData.seats);
          done();
        });
    });
    it(`GET to ${url}/:id shows new data`, done => {
      request
        .get(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          done();
        });
    });
    it(`PUT to ${url}/:id returns modified data`, done => {
      testData.seats = 40;
      request
        .put(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          assert.propertyVal(result, 'seats', testData.seats);
          done();
        });
    });
    it(`DELETE to ${url}/:id by unauthorized user fails`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not Authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });
    it(`DELETE to ${url}/:id by authorized user completes`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'resource with this id not found')
              done();
            });
        });
    });
  });

  describe('movie endpoint', () => {
    const url = '/api/movies';
    const testData = {
      key: 'testKey',
      OMDbRef: 'testRef',
    };
    it(`POST to ${url} completes with id`, done => {
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id;
          assert.property(result, '_id');
          assert.propertyVal(result, 'key', testData.key);
          done();
        });
    });
    it(`GET to ${url}/:id shows new data`, done => {
      request
        .get(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          done();
        });
    });
    it(`PUT to ${url}/:id returns modified data`, done => {
      testData.key = 'newtest';
      request
        .put(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          assert.propertyVal(result, 'key', testData.key);
          done();
        });
    });
    it(`DELETE to ${url}/:id by unauthorized user fails`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not Authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });
    it(`DELETE to ${url}/:id by authorized user completes`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'resource with this id not found')
              done();
            });
        });
    });
  });

  describe('location endpoint', () => {
    const url = '/api/locations';
    const testData = {
      name: 'test',
      city: 'testCity',
      state: 'testState',
      zip: 12347,
      country: 'testCountry',
      address: 'testAddress',
    };

    it(`POST to ${url} completes with id`, done => {
      // console.log(testData);
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id;
          assert.property(result, '_id');
          assert.propertyVal(result, 'name', testData.name);
          done();
        });
    });
    it(`GET to ${url}/:id shows new data`, done => {
      request
        .get(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          done();
        });
    });
    it(`PUT to ${url}/:id returns modified data`, done => {
      testData.name = 'newtest';
      request
        .put(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          assert.propertyVal(result, 'name', testData.name);
          done();
        });
    });
    it(`DELETE to ${url}/:id by unauthorized user fails`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not Authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });
    it(`DELETE to ${url}/:id by authorized user completes`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'resource with this id not found')
              done();
            });
        });
    });
  });

  describe.skip('company endpoint', () => {
    const url = '/api/theaters';
    const testData = {
      name: 'test',
      seats: 30,
    };
    it(`POST to ${url} completes with id`, done => {
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id;
          assert.property(result, '_id');
          assert.propertyVal(result, 'name', testData.name);
          done();
        });
    });
    it(`GET to ${url}/:id shows new data`, done => {
      request
        .get(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          done();
        });
    });
    it(`PUT to ${url}/:id returns modified data`, done => {
      testData.name = 'newtest';
      request
        .put(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          assert.propertyVal(result, 'name', testData.name);
          done();
        });
    });
    it(`DELETE to ${url}/:id by unauthorized user fails`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not Authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });
    it(`DELETE to ${url}/:id by authorized user completes`, done => {
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => {
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'resource with this id not found')
              done();
            });
        });
    });
  });

  after('delete testuser1', function (done) {
    this.timeout(10000);
    request
    .delete(`/api/users/${testUser1.id}`)
    .set('authorization', `Bearer ${testAdmin.token}`)
    .end(done);
  });

  after('delete testuser2', function (done) {
    this.timeout(10000);
    request
    .delete(`/api/users/${testUser2.id}`)
    .set('authorization', `Bearer ${testAdmin.token}`)
    .end(done);
  });

  after('delete testAdmin', function (done) {
    this.timeout(10000);
    request
    .delete(`/api/users/${testAdmin.id}`)
    .set('authorization', `Bearer ${testAdmin.token}`)
    .end(done);
  });
});
