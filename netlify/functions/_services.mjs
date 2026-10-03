export const serviceDefaults = {
 therapeutic: {
  slug:'massagem-terapeutica', title:'Massagem Terapêutica',
  subtitle:'Alívio para o seu corpo, mais conforto para o seu dia.',
  intro:'Uso técnicas manuais e ajusto a pressão às suas necessidades para cuidar das regiões de maior tensão. Antes de começar, converso com você e preparo uma sessão voltada ao seu conforto e bem-estar.',
  benefits:['Cuidado com as tensões','Pressão personalizada','Conforto nos movimentos','Mais bem-estar'],
  steps:[['Avaliação','Converso com você sobre suas necessidades e pontos de tensão.'],['Técnica personalizada','Ajusto as manobras e a intensidade ao seu conforto.'],['Bem-estar','Finalizo com um cuidado pensado para sua rotina.']],
  indications:['Quem sente tensão muscular no dia a dia.','Quem passa muito tempo na mesma posição.','Quem busca relaxar após uma rotina intensa.','Quem deseja um atendimento personalizado.','Quem quer reservar um momento de autocuidado.'],
  quote:'Um momento de cuidado para um corpo mais leve.',
  note:'Se você tem dor intensa, lesão recente ou alguma condição de saúde, me avise antes da sessão. A massagem não substitui uma avaliação médica.'
 },
 relaxing: {
  slug:'massagem-relaxante',title:'Massagem Relaxante',
  subtitle:'Uma pausa para desacelerar e cuidar de você.',
  intro:'Combino movimentos suaves e ritmados em um ambiente acolhedor. Respeito suas preferências de pressão para oferecer um momento de tranquilidade, descanso e atenção ao seu corpo.',
  benefits:['Movimentos suaves','Uma pausa na rotina','Relaxamento','Cuidado acolhedor'],
  steps:[['Acolhimento','Escuto como você está e o que espera desse momento.'],['Ritmo tranquilo','Uso movimentos contínuos e pressão confortável.'],['Sua pausa','Respeito seu tempo para encerrar a sessão com tranquilidade.']],
  indications:['Quem deseja desacelerar a rotina.','Quem busca um momento de descanso.','Quem prefere uma massagem suave.','Quem sente tensões leves do dia a dia.','Quem quer incluir o autocuidado na rotina.'],
  quote:'Desacelere. Este momento é seu.',
  note:'Me informe sobre gestação, cirurgia recente ou alguma condição de saúde antes do atendimento, para que eu possa orientar o cuidado adequado.'
 },
 cupping: {
  slug:'ventosaterapia',title:'Ventosaterapia',
  subtitle:'Um cuidado complementar, pensado para você.',
  intro:'Utilizo ventosas com sucção controlada como parte de um atendimento personalizado. Converso com você antes da aplicação e acompanho sua sensibilidade durante toda a sessão.',
  benefits:['Sucção controlada','Atenção à sensibilidade','Abordagem individual','Cuidado complementar'],
  steps:[['Conversa inicial','Avalio suas necessidades e se a técnica é adequada para você.'],['Aplicação cuidadosa','Posiciono as ventosas e controlo a sucção conforme seu conforto.'],['Orientações','Explico os cuidados após a sessão e tiro suas dúvidas.']],
  indications:['Quem deseja conhecer uma técnica complementar.','Quem busca um cuidado voltado às tensões.','Quem prefere um atendimento individualizado.','Quem recebeu orientação de que a técnica é adequada.','Quem quer conversar sobre outras formas de autocuidado.'],
  quote:'Cada detalhe do cuidado respeita você.',
  note:'As ventosas podem deixar marcas temporárias. Me informe sobre medicamentos, alterações de pele e condições de saúde para avaliarmos a adequação da técnica.'
 },
 drainage: {
  slug:'drenagem-linfatica',title:'Drenagem Linfática',
  subtitle:'Delicadeza em cada movimento. Um momento de leveza.',
  intro:'Trabalho com movimentos leves, lentos e ritmados. Antes da sessão, converso com você sobre o motivo da procura e suas condições de saúde para definir um cuidado adequado e delicado.',
  benefits:['Toque delicado','Movimentos ritmados','Cuidado individual','Sensação de leveza'],
  steps:[['Avaliação inicial','Converso sobre suas necessidades e possíveis restrições.'],['Movimentos suaves','Aplico a técnica com pressão leve e ritmo tranquilo.'],['Cuidado contínuo','Oriento você sobre o atendimento e os próximos passos.']],
  indications:['Quem busca uma técnica de toque leve.','Quem deseja uma sensação de leveza.','Quem recebeu indicação para drenagem manual.','Quem quer um atendimento adaptado às suas necessidades.','Quem procura orientação antes de iniciar as sessões.'],
  quote:'Mais leveza, com delicadeza e atenção.',
  note:'Nem todo inchaço tem indicação de drenagem. Me informe sobre condições de saúde e orientações médicas antes de agendar.'
 }
};
export const serviceMedia = Object.fromEntries(Object.keys(serviceDefaults).flatMap(key=>[[key,`/assets/servico-${key}.webp`],[key+'Position',50],[key+'Indication',`/assets/servico-${key}.webp`],[key+'IndicationPosition',50]]));
