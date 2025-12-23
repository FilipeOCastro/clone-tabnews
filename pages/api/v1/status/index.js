function status(request, response) {
  // response.status(200).send("alunos curso .dev");
  response.status(200).json({ chave: "aluno acima da média" });
}

export default status;
