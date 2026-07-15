import { GithubOutlined } from "@ant-design/icons";

import { cn } from "@/lib/utils";

type GitHubLinkProps = {
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
};

export function GitHubLink({ className, style, disabled = false }: GitHubLinkProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                disabled
                    ? "cursor-default text-stone-400 dark:text-stone-500"
                    : "text-stone-600 transition hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white",
                className,
            )}
            style={style}
            aria-label="GitHub"
            title="GitHub"
        >
            <GithubOutlined className="text-base" />
        </button>
    );
}
