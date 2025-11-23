# 📖 Instruções de Uso

## 🚀 Como Executar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

## 🧪 Testando o Fluxo Completo

### 1. Criar um Evento

1. Na página inicial, preencha o formulário:
   - **Título:** "Amigo Secreto de Natal 2024"
   - **Data:** Escolha uma data futura
   - **Valor mínimo:** 50.00
   - **Valor máximo:** 100.00
   - **Descrição:** (opcional)
   - **E-mail:** seu@email.com

2. Clique em "Criar evento"

3. **IMPORTANTE:** Abra o console do navegador (F12) para ver o código gerado
   - O código será exibido no formato: `[MOCK] Código enviado para seu@email.com: 123456`

4. Informe o código de 6 dígitos no modal que aparece

5. Você será redirecionado para o painel administrativo

### 2. Gerenciar Evento

1. No painel, você verá o evento criado

2. Clique em "Gerenciar evento"

3. **Adicionar participantes:**
   - Preencha nome e WhatsApp (apenas números, ex: 11999999999)
   - Clique em "Adicionar participante"
   - Repita para adicionar mais participantes

4. **Confirmar presença:**
   - Use o switch ao lado de cada participante para marcar como confirmado
   - É necessário pelo menos 2 participantes confirmados para realizar o sorteio

5. **Realizar sorteio:**
   - Quando houver 2+ participantes confirmados, clique em "Realizar sorteio"
   - Confirme a ação no modal
   - O sorteio será realizado e os resultados serão exibidos

### 3. Visualizar Resultados

Após o sorteio, você verá:
- Lista de pares: "Participante X → tirou → Participante Y"
- Status do evento atualizado para "Sorteio concluído"

## 🔍 Dicas

- **Código de verificação:** Sempre verifique o console do navegador para ver o código gerado
- **Persistência:** Os dados são salvos no localStorage do navegador
- **Limpar dados:** Para resetar, limpe o localStorage do navegador
- **Múltiplos eventos:** Você pode criar quantos eventos quiser com o mesmo e-mail

## 🐛 Solução de Problemas

### Código não aparece no console
- Certifique-se de que o console está aberto (F12 → Console)
- O código é gerado quando você clica em "Criar evento" ou "Enviar código"

### Erro ao realizar sorteio
- Verifique se há pelo menos 2 participantes confirmados
- Certifique-se de que os participantes têm nome e WhatsApp válidos

### Dados não persistem
- Os dados são salvos no localStorage
- Se você limpar o cache do navegador, os dados serão perdidos
- Em produção, os dados seriam salvos no backend

## 📝 Notas Importantes

- Este é um **frontend simulado** - não há backend real
- O envio de e-mail é simulado (código aparece no console)
- O envio de WhatsApp não está implementado (apenas visualização dos resultados)
- Todos os dados são armazenados localmente no navegador
