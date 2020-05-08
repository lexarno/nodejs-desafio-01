const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
const repositoryLikes = [];

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
      return response.status(400).json({ error: 'Invalid repository ID.' });
  }
  
  return next();
}

app.use('/repositories/:id', validateRepositoryId);

app.get("/repositories", (request, response) => {
  const { title } = request.query;

  const results = title
      ? repositories.filter(repository => repository.title.includes(title))
      : repositories;

  return response.json(results);
});

app.get("/repositories/:id/likes", (request, response) => {
  return response.json(repositoryLikes);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = { id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);

  const likesIndex = repositoryLikes.findIndex(repository => repository.repository_id == id);

  //const sum = repositoryLikes[likesIndex] ? repositoryLikes[likesIndex].likes + 1 : 1;

  if (repositoryIndex < 0) {
      return response.status(400).json({ error: 'Repository not found.' });
  }

  const repository = { id, title, url, techs, likes: 0 };

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
 
  const repositoryIndex = repositories.findIndex(repository => repository.id == id);

  if (repositoryIndex < 0) {
      return response.status(400).json({ error: 'Repository not found.' });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const likesIndex = repositoryLikes.findIndex(repository => repository.repository_id == id);
  const repositoryIndex = repositories.findIndex(repository => repository.id == id);
  
  const sum = repositoryLikes[likesIndex] ? repositoryLikes[likesIndex].likes + 1 : 1;

  const like = { id: uuid(), repository_id: id, likes: sum };

  repositoryLikes[likesIndex] = like;

  if (repositories[repositoryIndex]){
    repositories[repositoryIndex].likes = sum;
  }

  return response.json(like);
});

module.exports = app;
