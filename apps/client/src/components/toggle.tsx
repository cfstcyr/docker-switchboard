import clsx from 'clsx'
import type { JSX } from 'preact'

type Props = JSX.HTMLAttributes<HTMLDivElement> & {
    checked: boolean
}

export function Toggle({ checked, className, ...props }: Props) {
    return (
        <div
            className={clsx('toggle', className)}
            {...props}
            data-checked={checked}
        >
            <div className="toggle-thumb"></div>
        </div>
    )
}
