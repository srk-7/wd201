const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

let server, agent;

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign Up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "test",
      lastName: "test",
      email: "test@gmail.com",
      password: "test",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  // test("Creating a todo ", async () => {
  //   const res = await agent.get("/");
  //   const csrfToken = extractCsrfToken(res);
  //   const response = await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });
  //   expect(response.statusCode).toBe(302);
  // });

  // test("Mark a todo as Complete", async () => {
  //   let res = await agent.get("/");
  //   let csrfToken = extractCsrfToken(res);
  //   await agent.post("/todos").send({
  //     title: "buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });
  //   const groupedTodosResponse = await agent
  //     .get("/")
  //     .set("Accept", "application/json");

  //   const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
  //   const dueTodayCount = parsedGroupedResponse.dueToday.length;
  //   const newTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

  //   res = await agent.get("/");
  //   csrfToken = extractCsrfToken(res);

  //   const markCompleteResponse = await agent.put(`/todos/${newTodo.id}`).send({
  //     _csrf: csrfToken,
  //     completed: true,
  //   });
  //   const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
  //   expect(parsedUpdateResponse.completed).toBe(true);
  // });

  // test("Mark a todo as incomplete", async () => {
  //   let res = await agent.get("/");
  //   let csrfToken = extractCsrfToken(res);
  //   await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: true,
  //     _csrf: csrfToken,
  //   });
  //   const groupedTodos = await agent.get("/").set("Accept", "application/json");

  //   const parsedGroupedResponse = JSON.parse(groupedTodos.text);
  //   const dueTodayCount = parsedGroupedResponse.dueToday.length;
  //   const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

  //   res = await agent.get("/");
  //   csrfToken = extractCsrfToken(res);

  //   const markCompleteResponse = await agent
  //     .put(`/todos/${latestTodo.id}`)
  //     .send({
  //       _csrf: csrfToken,
  //       completed: false,
  //     });
  //   const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
  //   expect(parsedUpdateResponse.completed).toBe(false);
  // });

  // test("Deleting a todo", async () => {
  //   let res = await agent.get("/");
  //   let csrfToken = extractCsrfToken(res);
  //   await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });

  //   const groupedTodosResponse = await agent
  //     .get("/")
  //     .set("Accept", "application/json");
  //   const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
  //   const dueTodayCount = parsedGroupedResponse.dueToday.length;
  //   const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];
  //   res = await agent.get("/");
  //   csrfToken = extractCsrfToken(res);
  //   const deletedResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
  //     _csrf: csrfToken,
  //   });
  //   const parsedDeleteResponse = JSON.parse(deletedResponse.text);
  //   expect(parsedDeleteResponse["success"]).toBe(true);
  // });
});
