import { useState } from "react";

export default function ComprehensionCheck({
  criterion,
  initialAnswer = null,
  onAnswered,
}) {
  const [selected, setSelected] = useState(
    initialAnswer ? String(initialAnswer.choice) : "",
  );
  const [result, setResult] = useState(
    initialAnswer
      ? initialAnswer.correct
        ? "Correct!"
        : "Not quite — review the explanation above."
      : "",
  );
  const [alreadyAnswered] = useState(initialAnswer !== null);

  function handleSubmit(event) {
    event.preventDefault();
    if (selected === "") return;

    const choice = Number(selected);
    const isCorrect = choice === criterion.check.answer;
    setResult(
      isCorrect ? "Correct!" : "Not quite — review the explanation above.",
    );

    if (onAnswered) onAnswered(isCorrect, choice);
  }

  return (
    <section aria-labelledby="check-heading">
      <h2 id="check-heading">Check your understanding</h2>
      {alreadyAnswered && (
        <p className="banner banner-success">
          You already answered today&apos;s knowledge check.
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>{criterion.check.question}</legend>
          <ul className="check-choices">
            {criterion.check.choices.map((choice, index) => {
              const id = `check-choice-${index}`;
              return (
                <li key={id}>
                  <input
                    type="radio"
                    name="check-choice"
                    id={id}
                    value={index}
                    checked={selected === String(index)}
                    onChange={(event) => setSelected(event.target.value)}
                    required
                  />
                  <label htmlFor={id}>{choice}</label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <button type="submit">Submit answer</button>
      </form>
      <p className="check-result" role="status">
        {result}
      </p>
    </section>
  );
}
