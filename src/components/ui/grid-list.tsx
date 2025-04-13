import { GripHorizontal } from "lucide-react"
import {
  Button as AriaButton,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListItemProps as AriaGridListItemProps,
  GridListProps as AriaGridListProps,
  composeRenderProps,
} from "react-aria-components"

import { cn } from "@/lib/utils"

export function GridList<T extends object>({
  children,
  ...props
}: AriaGridListProps<T>) {
  return (
    <AriaGridList
      {...props}
      className={composeRenderProps(props.className, (className) =>
        cn(
          "flex flex-col gap-2 overflow-auto rounded-md border border-gray-800 bg-[#010220] p-1 text-white shadow-md outline-none",
          "data-[empty]:p-6 data-[empty]:text-center data-[empty]:text-sm",
          className
        )
      )}
    >
      {children}
    </AriaGridList>
  )
}

export function GridListItem({
  children,
  className,
  ...props
}: AriaGridListItemProps) {
  let textValue = typeof children === "string" ? children : undefined
  return (
    <AriaGridListItem
      textValue={textValue}
      className={composeRenderProps(className, (className) =>
        cn(
          "relative flex w-full cursor-default select-none items-center gap-3 rounded-sm px-2 py-1.5 text-sm outline-none",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "data-[focus-visible]:z-10 data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-gray-600 data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-[#000008]",
          "data-[hovered]:bg-gray-800 data-[hovered]:text-white",
          "data-[selected]:bg-gray-800 data-[selected]:text-white",
          "data-[dragging]:opacity-60",
          className
        )
      )}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          {renderProps.allowsDragging && (
            <AriaButton slot="drag">
              <GripHorizontal className="size-4" />
            </AriaButton>
          )}
          {children}
        </>
      ))}
    </AriaGridListItem>
  )
}