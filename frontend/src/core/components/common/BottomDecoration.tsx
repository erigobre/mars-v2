interface BottomDecorationProps {
  className?: string;
}

export default function BottomDecoration({
  className = "",
}: BottomDecorationProps) {
  return (
    <div
      className={`
        absolute -bottom-8 left-0 right-0 h-2/6 md:h-96 z-0 pointer-events-none bg-no-repeat xl:bg-repeat-x
        bg-cover xl:bg-contain 
        bg-position-[6%_bottom] md:bg-bottom
        ${className}
      `}
      style={{
        backgroundImage: "var(--bg-pattern-bottom)",
      }}
    />
  );
}
