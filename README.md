# 🤖 Run & Gun - Survive the Robots!

Um jogo de ação 2D estilo arcade, desenvolvido inteiramente em **HTML5 Canvas, CSS e JavaScript puro**. O objetivo é sobreviver o maior tempo possível contra hordas de robôs, acumulando a maior pontuação.

![Run & Gun - Survive The Robots](Files/Run%20%26%20Gun%20-%20Survive%20The%20Robots.png)

## 🎮 Como Jogar

O jogo é focado em reflexos, posicionamento estratégico e uso inteligente das mecânicas de plataforma.

### Controles
| Tecla | Ação |
| :--- | :--- |
| **A / D** | Mover para Esquerda / Direita |
| **W / Espaço** | Pular (Pressione 2x para Pulo Duplo) |
| **L** | Atirar |
| **P** | Pausar / Despausar |
| **R** | Reiniciar (após Game Over) |
| **F11** | Alternar Tela Cheia |

## 🚀 Mecânicas e Inimigos

Existem três tipos de robôs com comportamentos distintos:

1.  **Inimigo Comum (Vermelho)**:
    *   Causa dano se tocar nas laterais.
    *   Eles disparam um projétil lento contra você.
    *   **Dica:** Você pode pular na cabeça deles para usá-los como plataforma e recuperar seu pulo duplo!

2.  **Inimigo Espinhoso (Vermelho Escuro + Espinhos)**:
    *   **Cuidado!** Pular na cabeça deste inimigo causa morte instantânea.
    *   Eles não atiram, focando totalmente no perigo de contato.

3.  **Inimigo Bumper (Verde)**:
    *   Não causa dano.
    *   Ao tocar nas laterais, ele te lança com força para a direita.
    *   Ao pular na cabeça, ele funciona como uma mola, te lançando para o alto.


## 🎯 Objetivo
Sobreviva! Cada inimigo derrotado aumenta sua pontuação. A dificuldade (velocidade e frequência de inimigos) aumenta gradualmente conforme o tempo passa.

*   **HP:** Você começa com 5 corações.
*   **Invencibilidade:** Após tomar dano, você fica piscando e invulnerável por um breve período.

## 🛠️ Detalhes Técnicos
*   **Responsividade:** O jogo utiliza 100% da área da janela e se adapta dinamicamente ao redimensionamento.
*   **Performance:** Renderização otimizada via `requestAnimationFrame`.
*   **Sem Dependências:** Código 100% autônomo.

<br>

> Divirta-se! 🤖
