/**
 * "Daniel Campuzano" como texto real (sr-only) + una capa visual letra por
 * letra. Una ola de luz sube cada letra un escalón (~0.04em) y la aclara,
 * una vez por vuelta del loop. Server component: cero JS.
 */
export function Name({ text }: { text: string }) {
  let i = 0;
  return (
    <h1 className="pz-name">
      <span className="pz-sr">{text}</span>
      <span className="pz-name__vis" aria-hidden="true">
        {text.split(" ").map((word) => (
          <span key={word} className="pz-word">
            {[...word].map((ch) => {
              const idx = i++;
              return (
                <span key={idx} className="pz-l" style={{ "--i": idx } as React.CSSProperties}>
                  {ch}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </h1>
  );
}
