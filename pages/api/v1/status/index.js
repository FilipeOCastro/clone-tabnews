import database from "../../../../infra/database.js";

async function status(request, response) {
  // response.status(200).send("alunos curso .dev");
  const result = await database.query("SELECT 1 + 1;");
  response.status(200).json({ chave: "aluno acima da média" });
}

export default status;
