type ButtonProps = {
  children?: string
  onClick?: () => void
}

export const Button = ({
  onClick = () => {},
  children = 'Button',
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="rounded border border-blue-700 bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
    >
      {children}
    </button>
  )
}