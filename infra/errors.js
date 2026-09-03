export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Um erro interno não esperado aconteceu", {
      cause,
    });

    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message, action, context }) {
    super(message || "Serviço indisponível no momento.", {
      cause,
    });

    this.name = "ServiceError";
    this.action = action || "Verifique se o serciço está disponível";
    this.statusCode = 503;
    this.context = context;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
      context: this.context,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Método não é permitido para este endpoint");

    this.name = "MethodNotAllowedError";
    this.action =
      "Verifique se o método HTTP enviado é válido para este endpoint";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Um erro de validação ocorreu.", {
      cause,
    });

    this.name = "ValidationError";
    this.action = action || "Ajuste os dados informados";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Não foi possível encontrar o recurso no sisetma.", {
      cause,
    });

    this.name = "NotFoundError";
    this.action = action || "Verifique os parâmetros enviados na consulta.";
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ForbiddenError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Acesso negado.", {
      cause,
    });

    this.name = "ForbiddenError";
    this.action = action || "Verifique seus privilégios de acesso.";
    this.statusCode = 403;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Usuário não autorizado.", {
      cause,
    });

    this.name = "UnauthorizedError";
    this.action = action || "Façao Login novamente.";
    this.statusCode = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
