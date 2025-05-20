import { Check, Copy } from "lucide-preact";
import { useRef, useState } from "preact/hooks";
import type { HTMLAttributes } from "preact/compat";
import clsx from "clsx";

type Props = HTMLAttributes<HTMLButtonElement> & {
    text: string;
    size?: number;
};

export function CopyButton({ text, size, className, children, ...props }: Props) {
    const [isAnimating, setIsAnimating] = useState(false);
    const timeout = useRef<NodeJS.Timeout | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setIsAnimating(true);

        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
            setIsAnimating(false);
            timeout.current = null;
        }, 1000);
    };

    return (
        <button 
            onClick={handleCopy}
            name="Copy"
            className={clsx("flex items-center space-x-1 overflow-hidden", className)}
            {...props}
        >
            <Copy
                size={size}
                className={clsx("inline transition-[opacity,rotate] duration-300 shrink-0", isAnimating ? "opacity-0 rotate-90" : "opacity-100")}
            />
            <Check size={size} strokeWidth={4} className={clsx("absolute transition-[opacity,rotate] duration-300 text-green-500", isAnimating ? "opacity-100" : "opacity-0 rotate-90")} />
            <span className="text-ellipsis overflow-hidden">{children}</span>
        </button>
    );
}