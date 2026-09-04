import { useState, useEffect } from "react";

export default function ComprehensionCheck({
  criterion,
  initialAnswer = null,
  onAnswered,
}) {
  const [selected, setSelected] = useState(
    initialAnswer ? String(initialAnswer.choice) : "",
  );
  const [isCorrect, setIsCorrect] = useState(
    initialAnswer ? initialAnswer.correct : null,
  );
  const [alreadyAnswered, setAlreadyAnswered] = useState(
    initialAnswer !== null,
  );

  // TodayApp can't know whether today's criterion was already answered until
  // after its own mount effect reads localStorage (see CriterionApp.jsx), so
  // initialAnswer may arrive as null on this component's first render and
  // switch to a real value on a later render. useState's initializer only
  // runs once, so it wouldn't pick that up — sync explicitly when it happens.
  useEffect(() => {
    if (initialAnswer === null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(String(initialAnswer.choice));
    setIsCorrect(initialAnswer.correct);
    setAlreadyAnswered(true);
  }, [initialAnswer]);

  function handleSubmit(event) {
    event.preventDefault();
    if (selected === "") return;

    const choice = Number(selected);
    const correct = choice === criterion.check.answer;
    setIsCorrect(correct);

    if (onAnswered) onAnswered(correct, choice);
  }

  return (
    <section
      aria-labelledby="check-heading"
      className="no-print pt-10 border-t border-rule mt-10"
    >
      <h2
        id="check-heading"
        className="font-mono text-[0.8rem] font-semibold tracking-[0.08em] uppercase text-ink-quiet mb-5"
      >
        Check your understanding
      </h2>
      {alreadyAnswered && (
        <p className="max-w-[38rem] rounded-[0.3em] text-[0.95rem] font-semibold px-[1.4em] py-[0.7em] mb-5 text-center bg-moss-bg text-moss border border-moss">
          You already answered today&apos;s knowledge check.
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <fieldset className="border-0 m-0 p-0">
          <legend className="p-0 font-display font-medium text-xl leading-[1.4] text-ink mb-5">
            {criterion.check.question}
          </legend>
          <ul className="flex flex-col gap-[0.6rem] m-0 mb-5 p-0 list-none">
            {criterion.check.choices.map((choice, index) => {
              const id = `check-choice-${index}`;
              return (
                <li
                  key={id}
                  className="flex items-start gap-[0.7rem] px-4 py-[0.85rem] border border-rule rounded-[0.4em]"
                >
                  <input
                    type="radio"
                    name="check-choice"
                    id={id}
                    value={index}
                    checked={selected === String(index)}
                    onChange={(event) => setSelected(event.target.value)}
                    required
                    className="mt-[0.2em] accent-signal shrink-0"
                  />
                  <label htmlFor={id} className="text-base leading-normal">
                    {choice}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <button
          type="submit"
          className="font-body font-semibold text-[0.95rem] text-paper bg-ink border border-ink rounded-[0.3em] px-[1.4em] py-[0.7em] cursor-pointer hover:bg-signal hover:border-signal"
        >
          Submit answer
        </button>
      </form>
      <p
        className="max-w-[38rem] font-mono text-[0.9rem] mt-3 mb-0"
        role="status"
      >
        {isCorrect === null
          ? ""
          : isCorrect
            ? "Correct!"
            : "Not quite — review the explanation above."}
      </p>
      {isCorrect && (
        <p className="max-w-[38rem] text-[0.95rem] mt-3 mb-0">
          Ready for more?{" "}
          <a
            className="text-ink underline hover:text-signal"
            href={`${import.meta.env.BASE_URL}random/`}
          >
            Test yourself with a random criterion
          </a>
          , or{" "}
          <a
            className="text-ink underline hover:text-signal"
            href={`${import.meta.env.BASE_URL}browse/`}
          >
            browse the full list
          </a>{" "}
          to explore at your own pace.
        </p>
      )}
    </section>
  );
}
