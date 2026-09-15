import { cartao } from "@/lib/estilos";

export function TermosConteudo() {
  return (
    <div className="flex flex-col gap-4">
      <div className={`flex flex-col gap-2 ${cartao}`}>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Este documento é um rascunho elaborado para fins de Trabalho de
          Conclusão de Curso e não substitui aconselhamento jurídico
          profissional. Antes de qualquer uso real da plataforma, recomenda-se
          revisão por um advogado especialista em proteção de dados.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          1. Termos de Uso
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Ao criar uma conta no Reclame Cidade, você concorda em fornecer
          informações verdadeiras, não publicar conteúdo ofensivo, difamatório,
          fraudulento ou fora do escopo de problemas urbanos do seu município,
          e assumir responsabilidade pelo conteúdo que publicar. O uso da
          plataforma para criar contas falsas, coordenar denúncias em massa de
          má-fé, ou manipular artificialmente a percepção pública sobre
          qualquer pessoa, órgão ou grupo político é proibido e pode resultar
          em suspensão da conta.
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Todo conteúdo submetido passa por um pipeline de moderação
          automatizada e, quando necessário, revisão humana, antes de ser
          publicado. Reclamações e denúncias podem ser rejeitadas, arquivadas
          ou ter o autor suspenso em caso de uso indevido, conforme os
          critérios descritos publicamente no repositório do projeto.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          2. Política de Privacidade (LGPD)
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Coletamos apenas os dados necessários para o funcionamento da
          plataforma: nome, e-mail, CPF (armazenado somente como hash,
          nunca em texto), telefone (opcional) e, quando você anexa fotos a
          uma reclamação, as imagens enviadas e seus metadados técnicos.
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Esses dados são usados para autenticação, prevenção de contas
          duplicadas ou falsas, comunicação sobre o andamento das suas
          reclamações, e auditoria do pipeline de moderação. Imagens
          passam por detecção automática de rosto e placa veicular, com
          desfoque antes da publicação.
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Você tem direito, a qualquer momento, de acessar, corrigir ou
          excluir seus dados pessoais pela página &quot;Minha conta&quot;. A
          exclusão de conta anonimiza seus dados pessoais; reclamações já
          publicadas são mantidas como registro de interesse público da
          cidade, sem identificação do autor.
        </p>
      </section>
    </div>
  );
}
