import '../src/lib/setup-dotenv';
import '../src/lib/setup-mongoose';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/lib/app';
import token from '../src/lib/token';
import User from '../src/models/user';

chai.use(chaiHttp);

const assert = chai.assert;
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
  OMDbRef: 'foo',
};

const mockLocation = {
  name: 'mock',
  city: 'mockCity',
  state: 'mockState',
  zip: 99999,
  country: 'mockCountry',
  address: 'mockAddress',
};

describe('integration', function () { // eslint-disable-line
  describe('user creation', function () { // eslint-disable-line
    before('create testAdmin user', function (done) { // eslint-disable-line
      this.timeout(10000);
      const adminUser = new User(testAdmin);
      adminUser.generateHash(adminUser.password);
      adminUser.roles.push('admin');
      return adminUser
        .save()
        .then(newUser => {
          token.sign(newUser);
          testAdmin.id = newUser.id;
          done();
        });
    });

    before('get token for testAdmin', function (done) { // eslint-disable-line
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

    it('create testUser1', function (done) { // eslint-disable-line
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

    it('create testUser2', function (done) { // eslint-disable-line
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

    it('set testUser1 as admin', function (done) { // eslint-disable-line
      this.timeout(10000);
      request
        .post(`/api/users/${testUser1.id}/roles/admin`)
        .set('authorization', `Bearer ${testAdmin.token}`)
        .end(() => {
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

  describe('theater endpoint', function () { // eslint-disable-line
    const url = '/api/theaters';
    const testData = {
      name: 'test',
      seats: 30,
    };

    it(`POST to ${url} completes with id`, function (done) { // eslint-disable-line
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id; // eslint-disable-line
          assert.property(result, '_id');
          assert.propertyVal(result, 'name', testData.name);
          done();
        });
    });

    it(`GET to ${url}/:id shows new data`, function (done) { // eslint-disable-line
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

    it(`PUT to ${url}/:id returns modified data`, function (done) { // eslint-disable-line
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

    it(`DELETE to ${url}/:id by unauthorized user fails`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });

    it(`DELETE to ${url}/:id by authorized user completes`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'Resource with this ID not found');
              done();
            });
        });
    });
  });

  describe('screenings endpoint', function () { // eslint-disable-line
    const url = '/api/screenings';
    const testData = {
      attendanceTotal: 30,
      dateTime: new Date(),
      admissionsTotal: 400,
      seats: 30,
    };

    before('creating mock theater entry', function (done) { // eslint-disable-line
      this.timeout(2000);
      request
        .post('/api/theaters')
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(mockTheater)
        .end((err, res) => { // eslint-disable-line
          if (err) return done(err);
          const dtr = JSON.parse(res.text);
          testData.theater = dtr._id; // eslint-disable-line
          mockTheater.id = dtr._id; // eslint-disable-line
          done();
        });
    });

    before('creating mock movie entry', function (done) { // eslint-disable-line
      this.timeout(2000);
      request
        .post('/api/movies')
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(mockMovie)
        .end((err, res) => { // eslint-disable-line
          if (err) return done(err);
          const dmr = JSON.parse(res.text);
          mockMovie.id = dmr._id; // eslint-disable-line
          testData.movie = dmr._id; // eslint-disable-line
          done();
        });
    });

    it(`POST to ${url} completes with id`, function (done) { // eslint-disable-line
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id; // eslint-disable-line
          assert.property(result, '_id');
          assert.propertyVal(result, 'seats', testData.seats);
          done();
        });
    });

    it(`GET to ${url}/:id shows new data`, function (done) { // eslint-disable-line
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

    it(`PUT to ${url}/:id returns modified data`, function (done) { // eslint-disable-line
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

    it(`DELETE to ${url}/:id by unauthorized user fails`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });

    it(`DELETE to ${url}/:id by authorized user completes`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'Resource with this ID not found');
              done();
            });
        });
    });
  });

  describe('movie endpoint', function () { // eslint-disable-line
    const url = '/api/movies';
    const testData = {
      OMDbRef: 'testRef',
      title: 'testTitle',
      genre: ['test1', 'test2'],
      critic: 8,
      release: 1953,
      director: 'testDirector',
      country: 'testCountry',
    };

    it(`POST to ${url} completes with id`, function (done) { // eslint-disable-line
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id; // eslint-disable-line
          assert.property(result, '_id');
          assert.propertyVal(result, 'title', testData.title);
          done();
        });
    });

    it(`GET to ${url}/:id shows new data`, function (done) { // eslint-disable-line
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

    it(`PUT to ${url}/:id returns modified data`, function (done) { // eslint-disable-line
      testData.title = 'newtest';
      request
        .put(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, '_id', testData.id);
          assert.propertyVal(result, 'title', testData.title);
          done();
        });
    });

    it(`DELETE to ${url}/:id by unauthorized user fails`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });
    it(`DELETE to ${url}/:id by authorized user completes`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'Resource with this ID not found');
              done();
            });
        });
    });
  });

  describe('location endpoint', function () { // eslint-disable-line
    const url = '/api/locations';
    const testData = {
      name: 'test',
      city: 'testCity',
      state: 'testState',
      zip: 12347,
      country: 'testCountry',
      address: 'testAddress',
    };

    it(`POST to ${url} completes with id`, function (done) { // eslint-disable-line
      // console.log(testData);
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id; // eslint-disable-line
          assert.property(result, '_id');
          assert.propertyVal(result, 'name', testData.name);
          done();
        });
    });

    it(`GET to ${url}/:id shows new data`, function (done) { // eslint-disable-line
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

    it(`PUT to ${url}/:id returns modified data`, function (done) { // eslint-disable-line
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

    it(`DELETE to ${url}/:id by unauthorized user fails`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });

    it(`DELETE to ${url}/:id by authorized user completes`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'Resource with this ID not found');
              done();
            });
        });
    });
  });

  describe('company endpoint', () => {
    const url = '/api/companies';
    const testData = {
      name: 'test',
    };

    before('creating mock location entry', function (done) { // eslint-disable-line
      this.timeout(2000);
      request
        .post('/api/locations')
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(mockLocation)
        .end((err, res) => { // eslint-disable-line
          if (err) return (done(err));
          const dtr = JSON.parse(res.text);
          testData.locations = [dtr._id]; // eslint-disable-line
          done();
        });
    });

    it(`POST to ${url} completes with id`, function (done) { // eslint-disable-line
      request
        .post(url)
        .set('authorization', `Bearer ${testUser1.token}`)
        .send(testData)
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          const result = JSON.parse(res.text);
          testData.id = result._id; // eslint-disable-line
          assert.property(result, '_id');
          assert.propertyVal(result, 'name', testData.name);
          done();
        });
    });

    it(`GET to ${url}/:id shows new data`, function (done) { // eslint-disable-line
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

    it(`PUT to ${url}/:id returns modified data`, function (done) { // eslint-disable-line
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

    it(`DELETE to ${url}/:id by unauthorized user fails`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser2.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.isObject(result);
          assert.propertyVal(result, 'msg', 'Not authorized');
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser2.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, '_id', testData.id);
              done();
            });
        });
    });

    it(`DELETE to ${url}/:id by authorized user completes`, function (done) { // eslint-disable-line
      request
        .delete(`${url}/${testData.id}`)
        .set('authorization', `Bearer ${testUser1.token}`)
        .end((err, res) => {
          const result = JSON.parse(res.text);
          assert.propertyVal(result, '_id', testData.id);
          request
            .get(`${url}/${testData.id}`)
            .set('authorization', `Bearer ${testUser1.token}`)
            .end((err, res) => { // eslint-disable-line
              const getResult = JSON.parse(res.text);
              assert.propertyVal(getResult, 'msg', 'Resource with this ID not found');
              done();
            });
        });
    });
  });

  after('delete testuser1', function (done) { // eslint-disable-line
    this.timeout(10000);
    request
      .delete(`/api/users/${testUser1.id}`)
      .set('authorization', `Bearer ${testAdmin.token}`)
      .end(done);
  });

  after('delete testuser2', function (done) { // eslint-disable-line
    this.timeout(10000);
    request
      .delete(`/api/users/${testUser2.id}`)
      .set('authorization', `Bearer ${testAdmin.token}`)
      .end(done);
  });

  after('delete testAdmin', function (done) { // eslint-disable-line
    this.timeout(10000);
    request
      .delete(`/api/users/${testAdmin.id}`)
      .set('authorization', `Bearer ${testAdmin.token}`)
      .end(done);
  });
});
