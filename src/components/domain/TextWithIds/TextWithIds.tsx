const ID = /((?:REQ|FR|NFR|SC|TC|BUG)-\d+|Run \d+)/;

export function TextWithIds({ children }: { children: string }) {
  return (
    <>
      {children.split(ID).map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="font-mono font-normal">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
