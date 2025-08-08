import { ComponentProps } from "react";
export default function Button(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={
        "px-4 py-2 rounded-xl bg-brand-accent text-black font-bold " +
        (props.className ?? "")
      }
    />
  );
}
