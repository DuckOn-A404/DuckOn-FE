import React from "react";
import { useUiTranslate } from "../../hooks/useUiTranslate";

type UITextProps = {
  id: string;
  as?: React.ElementType;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export default function UIText({ id, as: Comp = "span", children, ...rest }: UITextProps) {
  const { t } = useUiTranslate();

  const fallback =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined;

  const text = t(id, fallback);

  return <Comp {...rest}>{text}</Comp>;
}
