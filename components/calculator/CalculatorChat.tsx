"use client";

import "./calculator.css";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { chips, composer, currentNode, nodeKey, summary, turns, type Composer as ComposerSpec, type Node } from "@/lib/chat";
import { NAME_MAX } from "@/lib/parse";
import { ChatResult } from "./ChatResult";
import { useChat } from "./useChat";

const TEXT_MAX = 60;

/** A caixa de texto da pergunta da vez. O texto some quando a pergunta muda (a chave é a pergunta). */
function Composer({ spec, node, labelId, onSubmit }: { spec: NonNullable<ComposerSpec>; node: Node; labelId: string; onSubmit: (text: string) => void }) {
  const [value, setValue] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };
  return (
    <form className="composer" onSubmit={submit} noValidate>
      <input
        id={`${labelId}-campo`}
        type="text"
        aria-labelledby={labelId}
        inputMode={spec.inputMode}
        enterKeyHint="send"
        autoComplete="off"
        autoCapitalize={node.id === "name" ? "sentences" : "none"}
        maxLength={node.id === "name" ? NAME_MAX : TEXT_MAX}
        placeholder={spec.placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className="btn btn-primary">
        Enviar
      </button>
    </form>
  );
}

/**
 * Uma conta só, montada numa conversa: a pergunta da vez, respostas de um toque (ou texto) e, no fim,
 * o cartão com a faixa de ganho e a conta aberta. A lógica inteira vive em lib/chat.ts; aqui só
 * desenho, foco e rolagem. Nada anima, ganha foco ou rola enquanto a pessoa não tiver respondido algo.
 */
export function CalculatorChat({ titled = true }: { titled?: boolean }) {
  const uid = useId();
  const { answers, error, result, moved, dispatch } = useChat();
  const node = currentNode(answers);
  const key = nodeKey(node);
  const list = turns(answers);
  const options = chips(answers, node);
  const spec = composer(answers, node);
  const labelId = `${uid}-${key.replace(":", "-")}`;

  const controlsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  // Depois de cada resposta: foco na caixa de texto (ou no primeiro toque) e a pergunta à vista.
  useEffect(() => {
    if (!moved) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduce ? "auto" : "smooth";
    if (node.id === "done") {
      resultRef.current?.focus({ preventScroll: true });
      resultRef.current?.scrollIntoView({ block: "start", behavior });
      return;
    }
    const box = controlsRef.current;
    const target = box?.querySelector<HTMLElement>("input") ?? box?.querySelector<HTMLElement>("button");
    target?.focus({ preventScroll: true });
    box?.scrollIntoView({ block: "nearest", behavior });
    // só quando a pergunta muda: marcar um tipo não é pergunta nova
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, moved]);

  return (
    <div className="chat">
      <div className="chat-flow">
        {node.id === "done" ? (
          <ul className="chips chips--answers" aria-label="Respostas">
            {summary(answers).map((item) => (
              <li key={item.key}>
                <button type="button" className="chip chip--answer" aria-label={`${item.label}. Tocar para corrigir.`} onClick={() => dispatch({ type: "rewind", key: item.key })}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="chat-log" role="log" aria-label="Conversa" aria-relevant="additions" hidden={node.id === "done"}>
          {list.map((turn) => (
            <div key={turn.key} className="turn" data-fresh={moved ? "true" : undefined}>
              <p className="bubble bubble--bot" id={`${uid}-${turn.key.replace(":", "-")}`}>
                {turn.question}
              </p>
              {turn.answer !== null ? (
                <button type="button" className="bubble bubble--me" aria-label={`${turn.answer}. Tocar para corrigir.`} onClick={() => dispatch({ type: "rewind", key: turn.key })}>
                  {turn.answer}
                </button>
              ) : null}
            </div>
          ))}
          {error ? <p className="bubble bubble--bot bubble--error">{error}</p> : null}
        </div>

        {node.id !== "done" ? (
          <div className="chat-controls" ref={controlsRef}>
            {options.length > 0 ? (
              <ul className="chips" aria-label="Respostas">
                {options.map((chip) => (
                  <li key={chip.key}>
                    <button type="button" className="chip" aria-pressed={chip.pressed} onClick={() => dispatch(chip.action)}>
                      {chip.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {node.id === "kinds" ? (
              <button type="button" className="btn btn-primary chat-done" disabled={answers.kinds.length === 0} onClick={() => dispatch({ type: "kindsDone" })}>
                Pronto
              </button>
            ) : null}
            {spec ? <Composer key={key} spec={spec} node={node} labelId={labelId} onSubmit={(text) => dispatch({ type: "text", text })} /> : null}
          </div>
        ) : null}
      </div>

      {node.id === "done" ? (
        result?.status === "ok" ? (
          <ChatResult
            ref={resultRef}
            result={result}
            name={answers.name ?? "Seu processo"}
            fromModel={answers.fromModel.length > 0}
            titled={titled}
            onRestart={() => dispatch({ type: "reset" })}
          />
        ) : (
          <div className="chat-controls">
            <button type="button" className="link-btn" onClick={() => dispatch({ type: "reset" })}>
              Recomeçar
            </button>
          </div>
        )
      ) : null}
    </div>
  );
}
