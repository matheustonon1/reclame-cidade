// A partir desta data, confirmar ("também sofro com isso") e denunciar
// passam a exigir e-mail verificado. Contas criadas antes disso ficam
// isentas — não é razoável exigir verificação retroativa de quem já
// usava a plataforma.
const DATA_EXIGENCIA_EMAIL = new Date("2026-09-10T00:00:00Z");

export function precisaVerificarEmail(usuario: {
  createdAt: Date;
  emailVerified: Date | null;
}): boolean {
  return usuario.createdAt >= DATA_EXIGENCIA_EMAIL && !usuario.emailVerified;
}
