import { cn } from "@/lib/utils";

export function Spinner(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "lucide lucide-loader-circle h-5 w-5 animate-spin",
        props.className,
      )}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
