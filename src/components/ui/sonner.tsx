import { CircleCheckIcon } from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Warna, radius, dan z-index toast diatur lewat token di theme.css (selektor [data-sonner-toaster]).
// Hanya sukses yang dipakai: error tetap Alert inline di form.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      duration={3000}
      icons={{ success: <CircleCheckIcon className="size-4" /> }}
      {...props}
    />
  )
}

export { Toaster }
