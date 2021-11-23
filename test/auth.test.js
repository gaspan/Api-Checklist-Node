const request = require("supertest")("http://127.0.0.1:3000/api/v1/");
const expect = require("chai").expect;

describe("POST /signup", function () {
  it("returns user data and token", async function () {
    const response = await request
        .post("/signup")
        .set('Accept', 'application/json')
        .send({username:"ariyadi", email:"ariya@gmail.com", password:"password123"});

    expect(response.status).to.eql(201);
    const attributes = response.body;

    expect(attributes).to.have.all.keys("status", "token", "data");
    expect(attributes.status).to.eql("success");
    expect(attributes.token).to.be.a('string');
    expect(attributes.data).to.be.an('object');
    expect(attributes.data.user).to.be.an('object');
    expect(attributes.data.user._id).to.be.a('string');
    expect(attributes.data.user.username).to.eql('ariyadi');
    expect(attributes.data.user.email).to.eql('ariya@gmail.com');
    expect(attributes.data.user.__v).to.be.a('number');

  });
});

describe("POST /login", function () {
    it("returns user data and token", async function () {
      const response = await request
          .post("/login")
          .set('Accept', 'application/json')
          .send({email:"ariya@gmail.com", password:"password123"});
  
      expect(response.status).to.eql(200);
      const attributes = response.body;
  
      expect(attributes).to.have.all.keys("status", "token", "data");
      expect(attributes.status).to.eql("success");
      expect(attributes.token).to.be.a('string');
      expect(attributes.data).to.be.an('object');
      expect(attributes.data.user).to.be.an('object');
      expect(attributes.data.user._id).to.be.a('string');
      expect(attributes.data.user.username).to.eql('ariyadi');
      expect(attributes.data.user.email).to.eql('ariya@gmail.com');
      expect(attributes.data.user.__v).to.be.a('number');
  
    });
  });